package com.faaab.downloader;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.yausername.ffmpeg.FFmpeg;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLRequest;

import java.io.File;

public class MainActivity extends Activity {
    private EditText urlInput;
    private TextView status;
    private TextView info;
    private ProgressBar progress;
    private Button analyzeBtn;
    private Button mp3Btn;
    private Button mp4Btn;

    private volatile boolean engineReady = false;
    private volatile boolean busy = false;

    @Override
    public void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_main);

        urlInput = findViewById(R.id.urlInput);
        status = findViewById(R.id.status);
        info = findViewById(R.id.info);
        progress = findViewById(R.id.progress);
        analyzeBtn = findViewById(R.id.analyzeBtn);
        mp3Btn = findViewById(R.id.mp3Btn);
        mp4Btn = findViewById(R.id.mp4Btn);

        analyzeBtn.setOnClickListener(v -> analyze());
        mp3Btn.setOnClickListener(v -> download(true));
        mp4Btn.setOnClickListener(v -> download(false));

        Intent intent = getIntent();
        if (intent != null && Intent.ACTION_SEND.equals(intent.getAction())) {
            String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (shared != null && (shared.startsWith("http://") || shared.startsWith("https://"))) {
                urlInput.setText(shared.trim());
            }
        }

        requestLegacyStorageIfNeeded();
        initEngine();
    }

    private void requestLegacyStorageIfNeeded() {
        if (Build.VERSION.SDK_INT <= 28 &&
                checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                        != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 7);
        }
    }

    private void initEngine() {
        setBusyUi(true, "Inicializando yt-dlp + FFmpeg...");
        new Thread(() -> {
            try {
                YoutubeDL.getInstance().init(getApplicationContext());
                FFmpeg.getInstance().init(getApplicationContext());
                engineReady = true;
                runOnUiThread(() -> {
                    setBusyUi(false, "Pronto. Cole um link e escolha MP3 ou MP4.");
                    info.setText("Suporta sites compatíveis com yt-dlp. Não remove DRM nem proteções de acesso.");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    setBusyUi(false, "Falha ao inicializar: " + shortError(e));
                    info.setText("Feche e abra o app novamente. Se persistir, envie a mensagem de erro.");
                });
            }
        }).start();
    }

    private String readUrl() {
        String url = urlInput.getText().toString().trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            toast("Cole um link válido começando com http:// ou https://");
            return null;
        }
        return url;
    }

    private void analyze() {
        if (!engineReady) {
            toast("O motor ainda está inicializando.");
            return;
        }
        if (busy) return;

        String url = readUrl();
        if (url == null) return;

        setBusyUi(true, "Analisando o link...");
        info.setText("");

        new Thread(() -> {
            try {
                String title = YoutubeDL.getInstance().getInfo(url).getTitle();
                if (title == null || title.trim().isEmpty()) title = "Mídia encontrada";
                final String finalTitle = title;
                runOnUiThread(() -> {
                    info.setText("Encontrado: " + finalTitle);
                    setBusyUi(false, "Escolha MP3 ou MP4.");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    info.setText("");
                    setBusyUi(false, "Não consegui analisar: " + shortError(e));
                });
            }
        }).start();
    }

    private void download(boolean audioOnly) {
        if (!engineReady) {
            toast("O motor ainda está inicializando.");
            return;
        }
        if (busy) {
            toast("Já existe uma operação em andamento.");
            return;
        }

        String url = readUrl();
        if (url == null) return;

        File dir = new File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "FAAAB"
        );
        if (!dir.exists() && !dir.mkdirs()) {
            toast("Não consegui criar Downloads/FAAAB");
            return;
        }

        final String kind = audioOnly ? "MP3" : "MP4";
        setBusyUi(true, "Baixando " + kind + "... Isso pode levar alguns minutos.");

        new Thread(() -> {
            try {
                YoutubeDLRequest request = new YoutubeDLRequest(url);
                request.addOption("--no-playlist");
                request.addOption("--no-mtime");
                request.addOption("--windows-filenames");
                request.addOption("-o", dir.getAbsolutePath() + "/%(title).120s.%(ext)s");

                if (audioOnly) {
                    request.addOption("-f", "bestaudio/best");
                    request.addOption("-x");
                    request.addOption("--audio-format", "mp3");
                    request.addOption("--audio-quality", "0");
                } else {
                    request.addOption(
                            "-f",
                            "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best"
                    );
                    request.addOption("--merge-output-format", "mp4");
                }

                YoutubeDL.getInstance().execute(request);

                runOnUiThread(() -> {
                    setBusyUi(false, kind + " concluído.");
                    info.setText("Salvo em Downloads/FAAAB");
                    toast("Download concluído");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    setBusyUi(false, "Falha no download: " + shortError(e));
                    info.setText("Alguns sites exigem login, cookies ou bloqueiam downloads externos.");
                });
            }
        }).start();
    }

    private void setBusyUi(boolean value, String message) {
        busy = value;
        status.setText(message);
        progress.setVisibility(value ? View.VISIBLE : View.GONE);
        analyzeBtn.setEnabled(!value && engineReady);
        mp3Btn.setEnabled(!value && engineReady);
        mp4Btn.setEnabled(!value && engineReady);
    }

    private String shortError(Exception e) {
        String s = e.getMessage();
        if (s == null || s.trim().isEmpty()) s = e.getClass().getSimpleName();
        s = s.replace("\n", " ").replace("\r", " ").trim();
        if (s.length() > 220) s = s.substring(0, 220) + "...";
        return s;
    }

    private void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_LONG).show();
    }
}
