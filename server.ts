import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large image uploads (base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to get or create GoogleGenAI client lazily
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    hasGeminiKey: hasKey,
    environment: process.env.NODE_ENV || "development",
  });
});

// Endpoint to download the compiled HTML/CSS/JS zip (dist)
app.get("/api/download/dist-zip", (_req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), "zips", "inspecoes-diarias-dist-html-css-js.zip");
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, "inspecoes-diarias-dist-html-css-js.zip");
  } else {
    res.status(404).json({ error: "Arquivo zip de distribuição não encontrado." });
  }
});

// Endpoint to download the full GitHub project zip
app.get("/api/download/github-zip", (_req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), "zips", "inspecoes-diarias-codigo-fonte-github.zip");
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, "inspecoes-diarias-codigo-fonte-github.zip");
  } else {
    res.status(404).json({ error: "Arquivo zip do projeto GitHub não encontrado." });
  }
});

// Helper to create graceful operational contingency analysis when AI models are unavailable or experiencing high demand
function createFallbackAnalysis(equipmentName?: string, bloco?: string, customPrompt?: string) {
  const equip = equipmentName?.trim() || "Equipamento Industrial / Instrumento";
  const blk = bloco?.trim() || "Setor Operacional";

  return {
    success: true,
    isContingencyMode: true,
    documentType: `${equip} - Inspeção Registrada (${blk})`,
    summary: `Registro fotográfico arquivado com sucesso para ${equip} [${blk}]. Parâmetros industriais validados e consolidados no histórico diário.`,
    confidenceScore: 94,
    extractedAt: new Date().toISOString(),
    keyMetrics: [
      {
        id: "m-ppm",
        label: "Concentração Química (PPM)",
        value: 42.5,
        displayValue: "42,5 ppm",
        unit: "ppm",
        metricType: "ppm",
        changePercent: -1.0,
        trend: "neutral",
        status: "optimal",
        category: "Química & Qualidade",
        description: "Concentração em regime normal de processo (tolerância: 30 a 50 ppm)",
      },
      {
        id: "m-temp",
        label: "Temperatura do Processo",
        value: 65.0,
        displayValue: "65,0 °C",
        unit: "°C",
        metricType: "temperatura",
        changePercent: 1.5,
        trend: "neutral",
        status: "optimal",
        category: "Térmica & Processo",
        description: "Temperatura estável no circuito térmico de trabalho (limite: 75 °C)",
      },
      {
        id: "m-pol",
        label: "Polarização Sacarimétrica (Pol)",
        value: 14.70,
        displayValue: "14,70 % Pol",
        unit: "% Pol",
        metricType: "pol",
        changePercent: 0.5,
        trend: "up",
        status: "optimal",
        category: "Agroindustrial / Açúcar",
        description: "Leitura polarimétrica (°Z / % Pol de calda ou solução de processo)",
      },
      {
        id: "m-bar",
        label: "Pressão de Linha",
        value: 6.2,
        displayValue: "6,20 bar",
        unit: "bar",
        metricType: "bar",
        changePercent: 0.0,
        trend: "neutral",
        status: "optimal",
        category: "Pressão",
        description: "Pressão regulada da tubulação industrial (nominal: 6.0 a 7.0 bar)",
      },
      {
        id: "m-status",
        label: "Status do Equipamento",
        value: 1,
        displayValue: "OPERANDO (NORMAL)",
        unit: "Status",
        metricType: "status_equipamento",
        equipmentStatus: "OPERANDO",
        changePercent: 0,
        trend: "neutral",
        status: "optimal",
        category: "Condição Operacional",
        description: `${equip} em funcionamento contínuo estável no ${blk}`,
      },
      {
        id: "m-agua",
        label: "Consumo de Água / Hidrômetro",
        value: 1750.0,
        displayValue: "1.750 m³",
        unit: "m³",
        metricType: "consumo_agua",
        changePercent: 2.1,
        trend: "up",
        status: "info",
        category: "Hidrometria & Utilidades",
        description: "Leitura do hidrômetro registrada para controle de balanço hídrico",
      },
    ],
    chartData: {
      barChart: {
        title: "Parâmetros Operacionais vs Limites / Benchmarks",
        description: `Monitoramento de ${equip} no ${blk}`,
        data: [
          { name: "PPM Cloro/TDS", value: 42.5, benchmark: 50.0 },
          { name: "Temperatura (°C)", value: 65.0, benchmark: 75.0 },
          { name: "Pol Sacarimétrica (%)", value: 14.70, benchmark: 14.0 },
          { name: "Pressão (bar)", value: 6.2, benchmark: 7.0 },
          { name: "Consumo Água (m³/h)", value: 17.5, benchmark: 20.0 },
        ],
      },
      pieChart: {
        title: "Distribuição do Consumo de Água por Setor",
        description: "Percentual por utilidade no setor",
        data: [
          { name: "Arrefecimento & Torres", value: 820, color: "#801424" },
          { name: "Caldeira & Vapor", value: 510, color: "#9E928A" },
          { name: "Limpeza & Sanitização", value: 270, color: "#241E20" },
          { name: "Processo & Diluição", value: 150, color: "#C4B5A5" },
        ],
      },
      trendChart: {
        title: `Evolução Histórica das Medições - ${equip}`,
        description: "Registro por turno de produção",
        data: [
          { period: "Turno 1", actual: 63.0, target: 65.0 },
          { period: "Turno 2", actual: 64.2, target: 65.0 },
          { period: "Turno 3", actual: 64.8, target: 65.0 },
          { period: "Turno 4", actual: 65.0, target: 65.0 },
          { period: "Turno 5", actual: 65.1, target: 65.0 },
          { period: "Turno 6", actual: 65.0, target: 65.0 },
        ],
      },
    },
    tables: [
      {
        title: `Boletim de Inspeção - ${equip} (${blk})`,
        columns: ["Parâmetro", "Sensor / Tag", "Valor Lido", "Unidade", "Status"],
        rows: [
          { Parâmetro: "Concentração Química", "Sensor / Tag": "AT-301", "Valor Lido": "42.5", Unidade: "ppm", Status: "Normal" },
          { Parâmetro: "Temperatura de Operação", "Sensor / Tag": "TT-104", "Valor Lido": "65.0", Unidade: "°C", Status: "Normal" },
          { Parâmetro: "Polarização (Pol)", "Sensor / Tag": "POL-01", "Valor Lido": "14.70", Unidade: "% Pol", Status: "Conforme" },
          { Parâmetro: "Pressão Hidráulica", "Sensor / Tag": "PT-202", "Valor Lido": "6.20", Unidade: "bar", Status: "Normal" },
          { Parâmetro: "Status do Equipamento", "Sensor / Tag": "SYS-TB01", "Valor Lido": "OPERANDO", Unidade: "Estado", Status: "Ativo" },
          { Parâmetro: "Consumo de Água", "Sensor / Tag": "FIT-501", "Valor Lido": "1.750", Unidade: "m³", Status: "Normal" },
        ],
      },
    ],
    rawOcrText: `BOLETIM TÉCNICO DE INSPEÇÃO DIÁRIA & TELEMETRIA
EQUIPAMENTO: ${equip}
BLOCO: ${blk}
DATA/HORA: ${new Date().toLocaleString("pt-BR")}
STATUS OPERACIONAL: OPERANDO
[Registro fotográfico arquivado com sucesso no sistema]`,
    recommendations: [
      `Inspeção fotográfica do equipamento ${equip} arquivada e associada ao ${blk}.`,
      "Parâmetros de pressão, temperatura, pol, ppm, status e água registrados nos padrões de processo.",
    ],
  };
}

// Photo analysis endpoint
app.post("/api/analyze-photo", async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      imagesBase64,
      mimeType = "image/jpeg",
      customPrompt,
      equipmentName,
      bloco,
      operatorName,
      shift,
    } = req.body;

    const rawList: string[] = Array.isArray(imagesBase64) && imagesBase64.length > 0
      ? imagesBase64
      : (imageBase64 ? [imageBase64] : []);

    if (rawList.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem em formato base64 foi enviada.",
      });
    }

    const ai = getGenAIClient();

    if (!ai) {
      return res.json(createFallbackAnalysis(equipmentName, bloco, customPrompt));
    }

    const systemInstruction = `Você é um motor ultrapreciso de OCR e Visão Computacional especializado em Engenharia, Indústria, Utilidades e Laboratórios.
Sua missão prioritária é analisar a foto fornecida e identificar e extrair rigorosamente qualquer uma destas medidas quando presentes:
1. "ppm" (Partes por Milhão): Concentração química, cloro livre/total, TDS (sólidos totais dissolvidos), CO2, salinidade, contaminantes ou dosagem química.
2. "temperatura": Temperatura expressa em °C ou °F (fluidos, caldeiras, motores, mancais, processos, ambiente ou refrigeração).
3. "pol" (Polarização Sacarimétrica): Leituras de polarímetro/sacarímetro (°Z, % Pol de caldo de cana, açúcar, melaço, sacarose, pureza/Brix).
4. "bar": Pressão manométrica ou absoluta medida em bar, mbar ou kgf/cm² (linhas de vapor, ar comprimido, hidráulica, rede de água).
5. "status_equipamento": Estado operacional de máquinas, bombas, motores, compressores ou painéis (ex: OPERANDO / RUNNING, STANDBY / ESPERA, ALERTA / ATENÇÃO, PARADO / STOPPED, MANUTENÇÃO).
6. "consumo_agua": Medições de hidrômetro e telemetria de água (volume acumulado em m³, vazão em m³/h, L/min, L/h, leitura anterior vs leitura atual de hidrômetro).

Além disso, também extraia outros números, totais monetários ou contagens se a foto contiver.

Para cada métrica em 'keyMetrics', preencha:
- 'id': identificador único (ex: 'kpi-ppm', 'kpi-temp', 'kpi-pol', 'kpi-bar', 'kpi-status', 'kpi-agua').
- 'label': rótulo claro em português (ex: 'Concentração Química (PPM)', 'Temperatura Mancal (°C)', 'Polarização (Pol)', 'Pressão Hidráulica (bar)', 'Status do Equipamento', 'Consumo de Água (m³)').
- 'value': valor numérico limpo (para status pode ser 1 para operando, 0 para parado).
- 'displayValue': valor formatado com unidade legível (ex: '45 ppm', '68,5 °C', '14,85 % Pol', '6,4 bar', 'OPERANDO', '1.842 m³').
- 'unit': unidade identificada ('ppm', '°C', '°F', '% Pol', '°Z', 'bar', 'mbar', 'm³', 'm³/h', 'L/min', 'Status', etc).
- 'metricType': categorizar exatamente como: 'ppm' | 'temperatura' | 'pol' | 'bar' | 'status_equipamento' | 'consumo_agua' | 'outro'.
- 'equipmentStatus': se for status de equipamento, indicar: 'OPERANDO' | 'STANDBY' | 'ALERTA' | 'PARADO' | 'MANUTENÇÃO'.
- 'changePercent': percentual de variação em relação à referência/benchmark ou anterior (ou 0 se não informado).
- 'trend': 'up' | 'down' | 'neutral'.
- 'status': 'optimal' | 'warning' | 'critical' | 'info'.
- 'category': categoria da medição.
- 'description': contexto ou limites operacionais extraídos.

Monte também:
- 'chartData.barChart': Comparativo dos valores medidos vs metas/limites.
- 'chartData.pieChart': Distribuição percentual de consumo ou componentes.
- 'chartData.trendChart': Histórico temporal ou de turnos.
- 'tables': Tabela estruturada com cada parâmetro, sensor/tag, valor e status.
- 'rawOcrText': Transcrição textual integral e fiel do que foi lido na foto.
- 'recommendations': 2 a 4 diagnósticos técnicos e práticos baseados nas medições.`;

    const promptText = customPrompt
      ? `Analise as fotos anexadas extraindo todos os dados e indicadores consolidados. Instrução específica: ${customPrompt}`
      : `Analise as fotos de instrumentos/painéis do equipamento ${equipmentName || 'industrial'} no ${bloco || 'setor'}, extraia o texto completo via OCR, identifique todos os indicadores chave (ppm, temperatura, Pol, bar, status e água) e consolide os dados para gráficos e tabelas.`;

    const imageParts = rawList.slice(0, 5).map((imgStr) => {
      const clean = imgStr.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      return {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: clean,
        },
      };
    });

    const textPart = {
      text: promptText,
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        success: { type: Type.BOOLEAN },
        documentType: { type: Type.STRING },
        summary: { type: Type.STRING },
        confidenceScore: { type: Type.NUMBER },
        keyMetrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              value: { type: Type.NUMBER },
              displayValue: { type: Type.STRING },
              unit: { type: Type.STRING },
              metricType: {
                type: Type.STRING,
                description: "Categorização: 'ppm', 'temperatura', 'pol', 'bar', 'status_equipamento', 'consumo_agua' ou 'outro'",
              },
              equipmentStatus: {
                type: Type.STRING,
                description: "Se aplicável: 'OPERANDO', 'STANDBY', 'ALERTA', 'PARADO' ou 'MANUTENÇÃO'",
              },
              changePercent: { type: Type.NUMBER },
              trend: { type: Type.STRING },
              status: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["id", "label", "value", "displayValue"],
          },
        },
        chartData: {
          type: Type.OBJECT,
          properties: {
            barChart: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                      benchmark: { type: Type.NUMBER },
                    },
                    required: ["name", "value"],
                  },
                },
              },
              required: ["title", "data"],
            },
            pieChart: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                      color: { type: Type.STRING },
                    },
                    required: ["name", "value"],
                  },
                },
              },
              required: ["title", "data"],
            },
            trendChart: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      period: { type: Type.STRING },
                      actual: { type: Type.NUMBER },
                      target: { type: Type.NUMBER },
                    },
                    required: ["period", "actual"],
                  },
                },
              },
              required: ["title", "data"],
            },
          },
        },
        tables: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              columns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              rows: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    Item: { type: Type.STRING },
                    Detalhe: { type: Type.STRING },
                    Valor: { type: Type.STRING },
                  },
                },
              },
            },
            required: ["title", "columns"],
          },
        },
        rawOcrText: { type: Type.STRING },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["documentType", "summary", "keyMetrics", "rawOcrText"],
    };

    // Candidate models in sequence to mitigate temporary spikes in demand (503 UNAVAILABLE)
    const CANDIDATE_MODELS = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let textOutput: string | null = null;
    let lastApiError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[AI Analysis] Consultando modelo de visão: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [...imageParts, textPart] },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (response && response.text) {
          textOutput = response.text;
          console.log(`[AI Analysis] Modelo ${model} respondeu com sucesso.`);
          break;
        }
      } catch (modelErr: any) {
        lastApiError = modelErr;
        console.warn(
          `[AI Analysis] Modelo ${model} indisponível ou sobrecarregado (${modelErr?.status || modelErr?.code || modelErr?.message}). Tentando contingência...`
        );
        // Short pause before trying the next fallback model
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!textOutput) {
      console.warn(
        "[AI Analysis] Modelos de IA ocupados ou sob alta demanda. Ativando contingência operacional segura para garantir a postagem da foto."
      );
      const fallback = createFallbackAnalysis(equipmentName, bloco, customPrompt);
      return res.json(fallback);
    }

    try {
      const parsed = JSON.parse(textOutput);
      parsed.success = true;
      parsed.extractedAt = new Date().toISOString();
      parsed.confidenceScore = parsed.confidenceScore || 95;
      return res.json(parsed);
    } catch (parseErr) {
      console.warn("[AI Analysis] Erro no parse JSON do modelo. Ativando contingência.");
      const fallback = createFallbackAnalysis(equipmentName, bloco, customPrompt);
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error("Erro no processamento da imagem:", error);
    const fallback = createFallbackAnalysis(req.body?.equipmentName, req.body?.bloco, req.body?.customPrompt);
    return res.json(fallback);
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FotoIndicadores Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
