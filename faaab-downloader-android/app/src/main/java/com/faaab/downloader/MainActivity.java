package com.faaab.downloader;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private EditText urlInput;
    private TextView status;
    private ListView list;

    private final ArrayList<String> found = new ArrayList<>();
    private ArrayAdapter<String> adapter;

    private static final Pattern MEDIA = Pattern.compile(
            "(?i)(?:href|src)\\s*=\\s*[\\\"']([^\\\"']+\\.(?:mp3|mp4|m4a|wav|ogg)(?:\\?[^\\\"']*)?)[\\\"']"
    );

    @Override
    public void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_main);

        urlInput = findViewById(R.id.urlInput);
        status = findViewById(R.id.status);
        list = findViewById(R.id.list);

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, found);
        list.setAdapter(adapter);

        findViewById(R.id.analyzeBtn).setOnClickListener(v -> analyze());
        findViewById(R.id.directBtn).setOnClickListener(v ->
                download(urlInput.getText().toString().trim()));

        list.setOnItemClickListener((parent, view, position, id) ->
                download(found.get(position)));
    }

    private void analyze() {
        final String s = urlInput.getText().toString().trim();

        if (!s.startsWith("http://") && !s.startsWith("https://")) {
            toast("Link inválido");
            return;
        }

        if (s.matches("(?i).+\\.(mp3|mp4|m4a|wav|ogg)(\\?.*)?$")) {
            found.clear();
            found.add(s);
            adapter.notifyDataSetChanged();
            status.setText("Link direto detectado. Toque no item para baixar.");
            return;
        }

        status.setText("Procurando MP3/MP4 na página...");
        found.clear();
        adapter.notifyDataSetChanged();

        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                URL page = new URL(s);
                c = (HttpURLConnection) page.openConnection();
                c.setConnectTimeout(15000);
                c.setReadTimeout(15000);
                c.setInstanceFollowRedirects(true);
                c.setRequestProperty("User-Agent", "Mozilla/5.0 FAAABDownloader/1.0");

                try (InputStream in = c.getInputStream()) {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] buffer = new byte[8192];
                    int n;
                    while ((n = in.read(buffer)) != -1) {
                        out.write(buffer, 0, n);
                    }

                    String html = new String(out.toByteArray(), StandardCharsets.UTF_8);
                    Matcher m = MEDIA.matcher(html);
                    LinkedHashSet<String> uniq = new LinkedHashSet<>();

                    while (m.find()) {
                        try {
                            uniq.add(new URL(page, m.group(1)).toString());
                        } catch (Exception ignored) {
                        }
                    }

                    runOnUiThread(() -> {
                        found.addAll(uniq);
                        adapter.notifyDataSetChanged();
                        status.setText(found.isEmpty()
                                ? "Nenhum link direto de mídia encontrado nessa página."
                                : "Encontrados: " + found.size() + " arquivo(s). Toque para baixar.");
                    });
                }
            } catch (Exception e) {
                final String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                runOnUiThread(() -> status.setText("Falha ao analisar: " + msg));
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    private void download(String s) {
        if (s == null || s.trim().isEmpty()) {
            toast("Cole um link primeiro");
            return;
        }

        if (!s.startsWith("http://") && !s.startsWith("https://")) {
            toast("Link inválido");
            return;
        }

        String lower = s.toLowerCase(Locale.ROOT);

        if (lower.contains("youtube.com/")
                || lower.contains("youtu.be/")
                || lower.contains("spotify.com/")
                || lower.contains("deezer.com/")) {
            new AlertDialog.Builder(this)
                    .setTitle("Link de streaming")
                    .setMessage("Este app baixa links diretos de mídia disponibilizados por páginas e sites. Para serviços de streaming, use o download oficial do próprio serviço/site quando disponível.")
                    .setPositiveButton("Abrir no navegador", (d, which) ->
                            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(s))))
                    .setNegativeButton("Cancelar", null)
                    .show();
            return;
        }

        try {
            Uri uri = Uri.parse(s);
            String name = guessName(uri);

            DownloadManager.Request r = new DownloadManager.Request(uri);
            r.setTitle(name);
            r.setDescription("FAAAB Downloader");
            r.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    "FAAAB/" + name);
            r.setAllowedOverMetered(true);
            r.setAllowedOverRoaming(false);

            ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
            toast("Download iniciado: " + name);
        } catch (Exception e) {
            toast("Erro: " + e.getMessage());
        }
    }

    private String guessName(Uri u) {
        String p = u.getLastPathSegment();

        if (p == null || p.trim().isEmpty()) {
            p = "arquivo_" + System.currentTimeMillis();
        }

        try {
            p = URLDecoder.decode(p, "UTF-8");
        } catch (Exception ignored) {
        }

        p = p.replaceAll("[^A-Za-z0-9._ -]", "_");

        if (!p.matches("(?i).+\\.(mp3|mp4|m4a|wav|ogg)$")) {
            p += ".bin";
        }

        return p;
    }

    private void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_LONG).show();
    }
}
