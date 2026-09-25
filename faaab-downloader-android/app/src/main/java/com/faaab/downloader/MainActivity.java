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
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import kotlin.Unit;
import kotlin.jvm.functions.Function3;

public class MainActivity extends Activity {
    private EditText urlInput;
    private TextView status;
    private TextView info;
    private ProgressBar progress;
    private Button analyzeBtn;
    private Button mp3Btn;
    private Button mp4Btn;
    private Button allBtn;
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
        allBtn = findViewById(R.id.allBtn);
        songList = findViewById(R.id.songList);

        analyzeBtn.setOnClickListener(v -> analyze());
        mp3Btn.setOnClickListener(v -> download(true));
        mp4Btn.setOnClickListener(v -> download(false));
        allBtn.setOnClickListener(v -> downloadAllSongs());

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
        progress.setIndeterminate(true);
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
                    progress.setIndeterminate(false);
                    progress.setMax(100);
                    progress.setProgress(0);
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

        progress.setIndeterminate(true);
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
                    progress.setIndeterminate(false);
                    progress.setProgress(0);
                    info.setText("Encontrado: " + finalTitle);
                    setBusyUi(false, "Escolha MP3 ou MP4.");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    progress.setIndeterminate(false);
                    progress.setProgress(0);
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

        File dir = getDownloadDir();
        if (dir == null) return;

        final String kind = audioOnly ? "MP3" : "MP4";
        progress.setIndeterminate(false);
        progress.setMax(100);
        progress.setProgress(0);
        setBusyUi(true, "Baixando " + kind + ": " + label);

        new Thread(() -> {
            try {
                if (audioOnly) {
                    executeAudioMp3(source, label, dir, 0, 1);
                } else {
                    executeVideoWithFallback(source, label, dir, 0, 1);
                }

                runOnUiThread(() -> {
                    progress.setProgress(100);
                    setBusyUi(false, kind + " concluído.");
                    info.setText("Salvo em Downloads/FAAAB — " + label);
                    toast("Download concluído");
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    setBusyUi(false, "Falha no download: " + shortError(e));
                    info.setText("O app tentou o link original, clientes alternativos e, para MP3, uma busca alternativa pelo nome da canção.");
                });
            }
        }).start();
    }

    private File getDownloadDir() {
        File dir = new File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "FAAAB"
        );
        if (!dir.exists() && !dir.mkdirs()) {
            toast("Não consegui criar Downloads/FAAAB");
            return null;
        }
        return dir;
    }

    private YoutubeDLRequest buildVideoRequest(String source, File dir, int strategy) {
        YoutubeDLRequest request = new YoutubeDLRequest(source);
        request.addOption("--no-playlist");
        request.addOption("--no-warnings");
        request.addOption("--no-mtime");
        request.addOption("--windows-filenames");
        request.addOption("--retries", "3");
        request.addOption("--fragment-retries", "3");
        request.addOption("--retry-sleep", "1");
        request.addOption("-o", dir.getAbsolutePath() + "/%(title).120s.%(ext)s");

        if (strategy == 1) {
            request.addOption("--extractor-args", "youtube:player_client=android_vr");
        } else if (strategy == 2) {
            request.addOption("--extractor-args", "youtube:player_client=web_safari");
        }

        request.addOption(
                "-f",
                "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best"
        );
        request.addOption("--merge-output-format", "mp4");
        return request;
    }

    private YoutubeDLRequest buildRawAudioRequest(String source, File tempDir, int strategy) {
        YoutubeDLRequest request = new YoutubeDLRequest(source);
        request.addOption("--no-playlist");
        request.addOption("--no-warnings");
        request.addOption("--no-mtime");
        request.addOption("--windows-filenames");
        request.addOption("--retries", "3");
        request.addOption("--fragment-retries", "3");
        request.addOption("--retry-sleep", "1");
        request.addOption("-o", new File(tempDir, "input.%(ext)s").getAbsolutePath());

        if (strategy == 1) {
            request.addOption("--extractor-args", "youtube:player_client=android_vr");
        } else if (strategy == 2) {
            request.addOption("--extractor-args", "youtube:player_client=web_safari");
        } else if (strategy == 3) {
            request.addOption("--extractor-args", "youtube:player_client=tv_embedded");
        }

        // IMPORTANTE: não usar -x/--audio-format aqui.
        // O postprocessamento do yt-dlp tentava chamar ffprobe e falhava no Android.
        if (strategy == 3) {
            request.addOption("-f", "best");
        } else {
            request.addOption("-f", "bestaudio/best");
        }
        return request;
    }

    private String safeFileName(String text) {
        String s = text.replaceAll("[\\\\/:*?\"<>|]", "_")
                .replaceAll("\\s+", " ")
                .trim();
        if (s.length() > 120) s = s.substring(0, 120).trim();
        if (s.isEmpty()) s = "audio";
        return s;
    }

    private void deleteRecursive(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) deleteRecursive(child);
            }
        }
        file.delete();
    }

    private File findDownloadedInput(File tempDir) throws Exception {
        File[] files = tempDir.listFiles();
        if (files == null || files.length == 0) {
            throw new Exception("yt-dlp terminou sem criar o arquivo de áudio");
        }

        File best = null;
        for (File f : files) {
            String n = f.getName().toLowerCase();
            if (!f.isFile() || n.endsWith(".part") || n.endsWith(".ytdl")) continue;
            if (best == null || f.length() > best.length()) best = f;
        }

        if (best == null || best.length() == 0) {
            throw new Exception("arquivo de áudio baixado está vazio");
        }
        return best;
    }

    private String runProcess(ProcessBuilder builder) throws Exception {
        builder.redirectErrorStream(true);
        Process process = builder.start();
        StringBuilder out = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (out.length() < 6000) out.append(line).append("\n");
            }
        }
        int exit = process.waitFor();
        if (exit != 0) {
            String msg = out.toString().trim();
            if (msg.length() > 800) msg = msg.substring(msg.length() - 800);
            if (msg.contains("libavdevice.so") || msg.contains("CANNOT LINK EXECUTABLE")) {
                throw new Exception("FFmpeg não conseguiu carregar as bibliotecas internas: " + msg);
            }
            throw new Exception("FFmpeg saiu com código " + exit + ": " + msg);
        }
        return out.toString();
    }

    private void convertToMp3(File input, File output) throws Exception {
        File ffmpeg = new File(getApplicationInfo().nativeLibraryDir, "libffmpeg.so");
        if (!ffmpeg.exists()) {
            throw new Exception("FFmpeg interno não encontrado");
        }

        if (output.exists()) output.delete();

        ProcessBuilder pb = new ProcessBuilder(
                ffmpeg.getAbsolutePath(),
                "-y",
                "-hide_banner",
                "-loglevel", "error",
                "-i", input.getAbsolutePath(),
                "-vn",
                "-map_metadata", "-1",
                output.getAbsolutePath()
        );
        File ffmpegLibDir = new File(
                getNoBackupFilesDir(),
                "youtubedl-android/packages/ffmpeg/usr/lib"
        );
        File pythonLibDir = new File(
                getNoBackupFilesDir(),
                "youtubedl-android/packages/python/usr/lib"
        );

        String ldPath = getApplicationInfo().nativeLibraryDir +
                ":" + ffmpegLibDir.getAbsolutePath() +
                ":" + pythonLibDir.getAbsolutePath();

        pb.environment().put("LD_LIBRARY_PATH", ldPath);
        runProcess(pb);

        if (!output.exists() || output.length() < 1024) {
            throw new Exception("FFmpeg não gerou um MP3 válido");
        }
    }

    private File downloadAudioSource(
            String source,
            String label,
            int itemIndex,
            int totalItems
    ) throws Exception {
        ArrayList<String> candidates = new ArrayList<>();
        candidates.add(source);

        String searchQuery = "ytsearch1:" +
                label.replace("—", " ")
                        .replace("–", " ")
                        .replaceAll("\\s+", " ")
                        .trim() +
                " oficial";

        if (!source.startsWith("ytsearch")) candidates.add(searchQuery);

        Exception last = null;

        for (int candidateIndex = 0; candidateIndex < candidates.size(); candidateIndex++) {
            String candidate = candidates.get(candidateIndex);

            for (int strategy = 0; strategy < 4; strategy++) {
                File tempDir = new File(getCacheDir(), "faaab_audio_" + System.nanoTime());
                tempDir.mkdirs();

                try {
                    final int chosenStrategy = strategy;
                    final int chosenCandidate = candidateIndex;
                    final String processId = "FAAAB_A_" + System.nanoTime();

                    Function3<Float, Long, String, Unit> callback =
                            new Function3<Float, Long, String, Unit>() {
                                @Override
                                public Unit invoke(Float itemProgress, Long eta, String line) {
                                    float p = itemProgress == null ? 0f : itemProgress;
                                    if (p < 0f) p = 0f;
                                    if (p > 100f) p = 100f;
                                    final float displayP = p;
                                    int overall = Math.min(
                                            99,
                                            Math.max(
                                                    0,
                                                    Math.round(((itemIndex + (p * 0.90f / 100f)) / totalItems) * 100f)
                                            )
                                    );

                                    runOnUiThread(() -> {
                                        progress.setProgress(overall);
                                        String retryText = "";
                                        if (chosenCandidate > 0) retryText += " • busca alternativa";
                                        if (chosenStrategy == 1) retryText += " • Android VR";
                                        if (chosenStrategy == 2) retryText += " • HLS/Safari";
                                        if (chosenStrategy == 3) retryText += " • TV/Best";
                                        status.setText(
                                                (itemIndex + 1) + "/" + totalItems +
                                                " • " + Math.round(displayP) + "% • " + label + retryText
                                        );
                                    });
                                    return Unit.INSTANCE;
                                }
                            };

                    YoutubeDLRequest request = buildRawAudioRequest(candidate, tempDir, strategy);
                    YoutubeDL.getInstance().execute(request, processId, callback);
                    return findDownloadedInput(tempDir);
                } catch (Exception e) {
                    last = e;
                    deleteRecursive(tempDir);
                }
            }
        }

        if (last != null) throw last;
        throw new Exception("não foi possível obter o áudio");
    }

    private void executeAudioMp3(
            String source,
            String label,
            File dir,
            int itemIndex,
            int totalItems
    ) throws Exception {
        File output = new File(dir, safeFileName(label) + ".mp3");

        if (output.exists() && output.length() > 4096) {
            runOnUiThread(() -> {
                int overall = Math.round(((itemIndex + 1f) / totalItems) * 100f);
                progress.setProgress(overall);
                status.setText((itemIndex + 1) + "/" + totalItems + " • já existe • " + label);
            });
            return;
        }

        File input = null;
        File tempParent = null;
        try {
            input = downloadAudioSource(source, label, itemIndex, totalItems);
            tempParent = input.getParentFile();

            runOnUiThread(() -> {
                int base = Math.round(((itemIndex + 0.90f) / totalItems) * 100f);
                progress.setProgress(Math.min(99, base));
                status.setText((itemIndex + 1) + "/" + totalItems + " • convertendo para MP3 • " + label);
            });

            convertToMp3(input, output);

            runOnUiThread(() -> {
                int overall = Math.round(((itemIndex + 1f) / totalItems) * 100f);
                progress.setProgress(overall);
            });
        } finally {
            if (tempParent != null) deleteRecursive(tempParent);
        }
    }

    private void executeVideoWithFallback(
            String source,
            String label,
            File dir,
            int itemIndex,
            int totalItems
    ) throws Exception {
        Exception last = null;

        for (int strategy = 0; strategy < 4; strategy++) {
            try {
                final int chosenStrategy = strategy;
                final String processId = "FAAAB_V_" + System.nanoTime();

                Function3<Float, Long, String, Unit> callback =
                        new Function3<Float, Long, String, Unit>() {
                            @Override
                            public Unit invoke(Float itemProgress, Long eta, String line) {
                                float p = itemProgress == null ? 0f : itemProgress;
                                    if (p < 0f) p = 0f;
                                    if (p > 100f) p = 100f;
                                int overall = Math.min(
                                        100,
                                        Math.max(
                                                0,
                                                Math.round(((itemIndex + (p / 100f)) / totalItems) * 100f)
                                        )
                                );
                                runOnUiThread(() -> {
                                    progress.setProgress(overall);
                                    String retryText = chosenStrategy == 0
                                            ? ""
                                            : chosenStrategy == 1
                                                ? " • Android VR"
                                                : chosenStrategy == 2
                                                    ? " • HLS/Safari"
                                                    : " • TV/Best";
                                    status.setText(
                                            (itemIndex + 1) + "/" + totalItems +
                                            " • " + Math.round(displayP) + "% • " + label + retryText
                                    );
                                });
                                return Unit.INSTANCE;
                            }
                        };

                YoutubeDLRequest request = buildVideoRequest(source, dir, strategy);
                YoutubeDL.getInstance().execute(request, processId, callback);
                return;
            } catch (Exception e) {
                last = e;
            }
        }

        if (last != null) throw last;
        throw new Exception("falha no download do vídeo");
    }

    private void downloadAllSongs() {
        if (!engineReady) {
            toast("O motor ainda está inicializando.");
            return;
        }
        if (busy) {
            toast("Já existe uma operação em andamento.");
            return;
        }

        File dir = getDownloadDir();
        if (dir == null) return;

        ArrayList<SongEntry> queue = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (SongEntry entry : SONGS) {
            if (!entry.downloadable) continue;

            String key = entry.song + "|" + entry.source;
            if (seen.add(key)) queue.add(entry);
        }

        if (queue.isEmpty()) {
            toast("Não há músicas para baixar.");
            return;
        }

        progress.setIndeterminate(false);
        progress.setMax(100);
        progress.setProgress(0);
        setBusyUi(true, "Preparando download de todas as músicas...");
        info.setText("0/" + queue.size() + " concluídas. Faixas repetidas serão baixadas apenas uma vez.");

        new Thread(() -> {
            int success = 0;
            ArrayList<String> failed = new ArrayList<>();

            for (int i = 0; i < queue.size(); i++) {
                SongEntry entry = queue.get(i);
                final int position = i;
                final int doneBefore = success;

                runOnUiThread(() -> {
                    status.setText(
                            (position + 1) + "/" + queue.size() +
                            " • iniciando " + entry.unit + " — " + entry.song
                    );
                    info.setText(
                            doneBefore + "/" + queue.size() +
                            " concluídas • " + failed.size() + " falharam"
                    );
                });

                try {
                    executeAudioMp3(
                            entry.source,
                            entry.unit + " — " + entry.song,
                            dir,
                            i,
                            queue.size()
                    );
                    success++;
                } catch (Exception e) {
                    failed.add(entry.unit + " — " + entry.song + ": " + shortError(e));
                }

                final int completed = success;
                final int failures = failed.size();
                final int overall = Math.round(((i + 1f) / queue.size()) * 100f);

                runOnUiThread(() -> {
                    progress.setProgress(overall);
                    info.setText(
                            completed + "/" + queue.size() +
                            " concluídas • " + failures + " falharam"
                    );
                });
            }

            final int finalSuccess = success;
            final ArrayList<String> finalFailed = failed;

            runOnUiThread(() -> {
                progress.setProgress(100);
                setBusyUi(false, "Download em lote finalizado.");

                if (finalFailed.isEmpty()) {
                    info.setText(
                            "Tudo pronto: " + finalSuccess + "/" + queue.size() +
                            " músicas salvas em Downloads/FAAAB."
                    );
                    toast("Todas as músicas foram baixadas");
                } else {
                    StringBuilder sb = new StringBuilder();
                    sb.append(finalSuccess).append("/").append(queue.size())
                            .append(" baixadas. ")
                            .append(finalFailed.size()).append(" falharam:\n");
                    for (String fail : finalFailed) {
                        sb.append("• ").append(fail).append("\n");
                    }
                    info.setText(sb.toString().trim());
                    toast("Lote concluído com algumas falhas");
                }
            });
        }).start();
    }

    private void setBusyUi(boolean value, String message) {
        busy = value;
        status.setText(message);
        progress.setVisibility(value ? View.VISIBLE : View.GONE);
        analyzeBtn.setEnabled(!value && engineReady);
        mp3Btn.setEnabled(!value && engineReady);
        mp4Btn.setEnabled(!value && engineReady);
        allBtn.setEnabled(!value && engineReady);
    }

    private String shortError(Exception e) {
        String s = e.getMessage();
        if (s == null || s.trim().isEmpty()) s = e.getClass().getSimpleName();

        s = s.replace("\r", "");
        String[] lines = s.split("\n");
        StringBuilder useful = new StringBuilder();

        for (String line : lines) {
            String t = line.trim();
            if (t.isEmpty()) continue;
            if (t.startsWith("WARNING: Your yt-dlp version")) continue;
            if (t.startsWith("WARNING: unable to obtain file audio codec with ffprobe")) continue;
            if (useful.length() > 0) useful.append(" | ");
            useful.append(t);
        }

        String out = useful.length() == 0 ? s.replace("\n", " ").trim() : useful.toString();
        if (out.length() > 700) out = "..." + out.substring(out.length() - 697);
        return out;
    }

    private void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_LONG).show();
    }
}
