package com.faaab.downloader;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.yausername.ffmpeg.FFmpeg;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLRequest;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private EditText urlInput;
    private TextView status;
    private TextView info;
    private ProgressBar progress;
    private Button analyzeBtn;
    private Button mp3Btn;
    private Button mp4Btn;
    private LinearLayout songList;

    private volatile boolean engineReady = false;
    private volatile boolean busy = false;

    private static class SongEntry {
        final String section;
        final String unit;
        final String song;
        final String source;
        final String youtubeUrl;
        final boolean downloadable;

        SongEntry(String section, String unit, String song, String source, String youtubeUrl, boolean downloadable) {
            this.section = section;
            this.unit = unit;
            this.song = song;
            this.source = source;
            this.youtubeUrl = youtubeUrl;
            this.downloadable = downloadable;
        }
    }

    private static String ytSearch(String query) {
        return "https://www.youtube.com/results?search_query=" +
                URLEncoder.encode(query, StandardCharsets.UTF_8);
    }

    private static final SongEntry[] SONGS = new SongEntry[] {
        new SongEntry("HINOS DAS FORÇAS", "Exército Brasileiro", "Canção do Exército Brasileiro",
                "https://www.youtube.com/watch?v=wzjrNJL0aBs",
                "https://www.youtube.com/watch?v=wzjrNJL0aBs", true),
        new SongEntry("HINOS DAS FORÇAS", "Marinha do Brasil", "Cisne Branco",
                "https://www.youtube.com/watch?v=50ZhNO9YmzY",
                "https://www.youtube.com/watch?v=50ZhNO9YmzY", true),
        new SongEntry("HINOS DAS FORÇAS", "Corpo de Fuzileiros Navais", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("HINOS DAS FORÇAS", "Força Aérea Brasileira", "Hino dos Aviadores",
                "https://www.youtube.com/watch?v=obEI5HusSO4",
                "https://www.youtube.com/watch?v=obEI5HusSO4", true),
        new SongEntry("HINOS DAS FORÇAS", "CBM", "Soldados do Fogo",
                "ytsearch1:Soldados do Fogo CBMERJ",
                ytSearch("Soldados do Fogo CBMERJ"), true),

        new SongEntry("EXÉRCITO BRASILEIRO", "1º BFE", "Canção das Forças Especiais",
                "https://www.youtube.com/watch?v=0Tl0WewRaV0",
                "https://www.youtube.com/watch?v=0Tl0WewRaV0", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "2º BPE", "Canção do 2º BPE",
                "ytsearch1:Canção do 2º BPE",
                ytSearch("Canção do 2º BPE"), true),
        new SongEntry("EXÉRCITO BRASILEIRO", "72º BI Caat", "Canção do 72º BI Caat",
                "ytsearch1:Canção do 72º Batalhão de Infantaria de Caatinga",
                ytSearch("Canção do 72º Batalhão de Infantaria de Caatinga"), true),
        new SongEntry("EXÉRCITO BRASILEIRO", "26º BI Pqdt", "Eterno Herói — Canção do Paraquedista",
                "https://www.youtube.com/watch?v=HCDN0GVtTAg",
                "https://www.youtube.com/watch?v=HCDN0GVtTAg", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "20º BIB", "Canção da Tropa Blindada",
                "https://www.youtube.com/watch?v=w3KVoOnnik4",
                "https://www.youtube.com/watch?v=w3KVoOnnik4", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "BCC", "Canção da Tropa Blindada (provisória)",
                "https://www.youtube.com/watch?v=w3KVoOnnik4",
                "https://www.youtube.com/watch?v=w3KVoOnnik4", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "1º BAC", "Canção dos Comandos",
                "https://www.youtube.com/watch?v=HTe8DKG82pE",
                "https://www.youtube.com/watch?v=HTe8DKG82pE", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "5º B Log", "Canção do 5º Batalhão Logístico",
                "ytsearch1:Canção do 5º Batalhão Logístico",
                ytSearch("Canção do 5º Batalhão Logístico"), true),
        new SongEntry("EXÉRCITO BRASILEIRO", "11º BI Mth", "Canção do Combatente de Montanha",
                "https://www.youtube.com/watch?v=J53WStFyvjo",
                "https://www.youtube.com/watch?v=J53WStFyvjo", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "B Sau", "Canção do Serviço de Saúde",
                "https://www.youtube.com/watch?v=qN192Om7POo",
                "https://www.youtube.com/watch?v=qN192Om7POo", true),
        new SongEntry("EXÉRCITO BRASILEIRO", "1º RCG", "Canção da Cavalaria",
                "https://www.youtube.com/watch?v=nVCH6f_XDyo",
                "https://www.youtube.com/watch?v=nVCH6f_XDyo", true),

        new SongEntry("MARINHA / CFN", "BOE FN / Tonelero", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("MARINHA / CFN", "BtlBldFuzNav", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("MARINHA / CFN", "BtlEngFuzNav", "Canção do Batalhão de Engenharia de Fuzileiros Navais",
                "ytsearch1:Canção do Batalhão de Engenharia de Fuzileiros Navais",
                ytSearch("Canção do Batalhão de Engenharia de Fuzileiros Navais"), true),
        new SongEntry("MARINHA / CFN", "BtlVtrAnf", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("MARINHA / CFN", "BtlArtFuzNav", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("MARINHA / CFN", "Comandos Anfíbios", "Canção dos Comandos Anfíbios",
                "ytsearch1:Canção Comandos Anfíbios Fuzileiros Navais",
                ytSearch("Canção Comandos Anfíbios Fuzileiros Navais"), true),
        new SongEntry("MARINHA / CFN", "CIAPOL", "Na Vanguarda",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo",
                "https://www.youtube.com/watch?v=ZkFsz5iA0Uo", true),
        new SongEntry("MARINHA / CFN", "BtlOpRib", "Hino do 1º Batalhão de Operações Ribeirinhas",
                "ytsearch1:Hino do 1º Batalhão de Operações Ribeirinhas",
                ytSearch("Hino do 1º Batalhão de Operações Ribeirinhas"), true),

        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-BR", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),
        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-CO", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),
        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-MN", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),
        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-RF", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),
        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-GL", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),
        new SongEntry("FORÇA AÉREA BRASILEIRA", "BINFAE-BE", "Canção da Infantaria da Aeronáutica",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE",
                "https://www.youtube.com/watch?v=ctQuRwVR5jE", true),

        new SongEntry("CBM — GRUPAMENTOS", "GBS", "Sem canção — regra atual do projeto", "", "", false),
        new SongEntry("CBM — GRUPAMENTOS", "GSFMA", "Sem canção — regra atual do projeto", "", "", false),
        new SongEntry("CBM — GRUPAMENTOS", "GOPP", "Sem canção — regra atual do projeto", "", "", false),
        new SongEntry("CBM — GRUPAMENTOS", "GOA", "Sem canção — regra atual do projeto", "", "", false),
        new SongEntry("CBM — GRUPAMENTOS", "GOESP", "Sem canção — regra atual do projeto", "", "", false)
    };

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
        songList = findViewById(R.id.songList);

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

        populateSongs();
        requestLegacyStorageIfNeeded();
        initEngine();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private TextView makeText(String text, float size, boolean bold) {
        TextView v = new TextView(this);
        v.setText(text);
        v.setTextSize(size);
        v.setTextColor(Color.rgb(25, 25, 25));
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return v;
    }

    private void populateSongs() {
        songList.removeAllViews();
        String lastSection = "";

        for (SongEntry entry : SONGS) {
            if (!entry.section.equals(lastSection)) {
                TextView header = makeText(entry.section, 18, true);
                LinearLayout.LayoutParams hp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );
                hp.topMargin = dp(24);
                hp.bottomMargin = dp(8);
                header.setLayoutParams(hp);
                songList.addView(header);
                lastSection = entry.section;
            }

            LinearLayout card = new LinearLayout(this);
            card.setOrientation(LinearLayout.VERTICAL);
            card.setPadding(dp(12), dp(10), dp(12), dp(10));
            card.setBackgroundColor(Color.rgb(245, 245, 245));

            LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            cp.bottomMargin = dp(8);
            card.setLayoutParams(cp);

            TextView unit = makeText(entry.unit, 16, true);
            card.addView(unit);

            TextView song = makeText(entry.song, 14, false);
            LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            sp.topMargin = dp(3);
            song.setLayoutParams(sp);
            card.addView(song);

            LinearLayout actions = new LinearLayout(this);
            actions.setOrientation(LinearLayout.HORIZONTAL);
            actions.setGravity(Gravity.CENTER_VERTICAL);
            LinearLayout.LayoutParams ap = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            ap.topMargin = dp(8);
            actions.setLayoutParams(ap);

            if (entry.downloadable) {
                Button youtube = new Button(this);
                youtube.setText("YouTube");
                youtube.setAllCaps(false);
                youtube.setOnClickListener(v -> {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(entry.youtubeUrl)));
                    } catch (Exception e) {
                        toast("Não consegui abrir o YouTube.");
                    }
                });

                Button download = new Button(this);
                download.setText("Baixar MP3");
                download.setAllCaps(false);
                download.setOnClickListener(v -> downloadFromSource(entry.source, entry.unit + " — " + entry.song));

                LinearLayout.LayoutParams bp1 = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1);
                LinearLayout.LayoutParams bp2 = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1);
                bp2.leftMargin = dp(8);
                actions.addView(youtube, bp1);
                actions.addView(download, bp2);
            } else {
                TextView none = makeText("Sem botão de download", 13, false);
                none.setTextColor(Color.DKGRAY);
                actions.addView(none);
            }

            card.addView(actions);
            songList.addView(card);
        }
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

                final String before = YoutubeDL.getInstance().versionName(getApplicationContext());
                runOnUiThread(() -> status.setText("Atualizando yt-dlp... versão atual: " + (before == null ? "desconhecida" : before)));

                String updateNote = "";
                try {
                    YoutubeDL.UpdateStatus updateStatus =
                            YoutubeDL.getInstance().updateYoutubeDL(
                                    getApplicationContext(),
                                    YoutubeDL.UpdateChannel._NIGHTLY
                            );
                    String after = YoutubeDL.getInstance().versionName(getApplicationContext());
                    updateNote = "yt-dlp atualizado: " + (after == null ? "versão mais recente" : after);
                    if (updateStatus == YoutubeDL.UpdateStatus.ALREADY_UP_TO_DATE) {
                        updateNote = "yt-dlp já estava atualizado: " + (after == null ? "versão atual" : after);
                    }
                } catch (Exception nightlyError) {
                    try {
                        YoutubeDL.getInstance().updateYoutubeDL(
                                getApplicationContext(),
                                YoutubeDL.UpdateChannel._STABLE
                        );
                        String after = YoutubeDL.getInstance().versionName(getApplicationContext());
                        updateNote = "yt-dlp atualizado pela versão estável: " + (after == null ? "mais recente" : after);
                    } catch (Exception stableError) {
                        updateNote = "Não foi possível atualizar o yt-dlp agora; usando a versão embutida.";
                    }
                }

                final String finalUpdateNote = updateNote;
                engineReady = true;
                runOnUiThread(() -> {
                    setBusyUi(false, "Pronto. Você pode usar a lista abaixo ou colar outro link.");
                    info.setText(finalUpdateNote + "\nOs botões “Baixar MP3” usam o vídeo indicado ou uma busca automática no YouTube quando ainda não há vídeo fixo.");
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
                YoutubeDLRequest infoRequest = new YoutubeDLRequest(url);
                infoRequest.addOption("--no-warnings");
                String title = YoutubeDL.getInstance().getInfo(infoRequest).getTitle();
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
        String url = readUrl();
        if (url == null) return;
        downloadFromSource(url, audioOnly ? "Link colado — MP3" : "Link colado — MP4", audioOnly);
    }

    private void downloadFromSource(String source, String label) {
        downloadFromSource(source, label, true);
    }

    private void downloadFromSource(String source, String label, boolean audioOnly) {
        if (!engineReady) {
            toast("O motor ainda está inicializando.");
            return;
        }
        if (busy) {
            toast("Já existe uma operação em andamento.");
            return;
        }

        File dir = new File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "FAAAB"
        );
        if (!dir.exists() && !dir.mkdirs()) {
            toast("Não consegui criar Downloads/FAAAB");
            return;
        }

        final String kind = audioOnly ? "MP3" : "MP4";
        setBusyUi(true, "Baixando " + kind + ": " + label);

        new Thread(() -> {
            try {
                YoutubeDLRequest request = new YoutubeDLRequest(source);
                request.addOption("--no-playlist");
                request.addOption("--no-warnings");
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
                    info.setText("Salvo em Downloads/FAAAB — " + label);
                    toast("Download concluído");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    setBusyUi(false, "Falha no download: " + shortError(e));
                    info.setText("Se esta faixa usou busca automática, toque em YouTube para conferir o resultado. Alguns vídeos também podem exigir login ou bloquear downloads externos.");
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
