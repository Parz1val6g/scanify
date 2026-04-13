# import cv2
# import json
# import os
# import requests
# import numpy as np
# import base64
# from pdf2image import convert_from_path
# from PIL import Image, ImageOps, ImageEnhance
# from io import BytesIO

# # ==========================================
# # CONFIGURAÇÃO DE AMBIENTE
# # ==========================================
# POPPLER_PATH = r"C:\Program Files\poppler\poppler-25.12.0\Library\bin"
# OLLAMA_URL = "http://100.118.62.128:11434/api/generate"
# MODEL_VISION = "llama3.2-vision:latest"
# CONFIG_FILE = 'areas_config.json'

# # Variáveis globais de controle
# ix, iy = -1, -1
# desenhando = False
# zona_atual_idx = 0
# coords_temp = {}
# img_display = None
# img_original = None
# LISTA_ZONAS = []
# CORES = [(0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255), (255, 0, 255)]

# # ==========================================
# # FERRAMENTA VISUAL DINÂMICA
# # ==========================================

# def rato_callback(event, x, y, flags, param):
#     global ix, iy, desenhando, img_display, zona_atual_idx, coords_temp

#     if zona_atual_idx >= len(LISTA_ZONAS): return

#     if event == cv2.EVENT_LBUTTONDOWN:
#         desenhando = True
#         ix, iy = x, y
#     elif event == cv2.EVENT_MOUSEMOVE:
#         if desenhando:
#             img_display = img_original.copy()
#             cor = CORES[zona_atual_idx % len(CORES)]
#             cv2.rectangle(img_display, (ix, iy), (x, y), cor, 2)
#             cv2.putText(img_display, f"A desenhar: {LISTA_ZONAS[zona_atual_idx]}", (10, 40),
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.8, cor, 2)
#     elif event == cv2.EVENT_LBUTTONUP:
#         desenhando = False
#         h, w = img_original.shape[:2]
#         x1, y1, x2, y2 = min(ix, x), min(iy, y), max(ix, x), max(iy, y)

#         nome_zona = LISTA_ZONAS[zona_atual_idx]
#         coords_temp[nome_zona] = {
#             "x": x1 / w, "y": y1 / h, "w": (x2 - x1) / w, "h": (y2 - y1) / h
#         }

#         cv2.rectangle(img_original, (x1, y1), (x2, y2), CORES[zona_atual_idx % len(CORES)], 2)
#         img_display = img_original.copy()
#         zona_atual_idx += 1

# def definir_zonas_visual(pdf_path):
#     global img_original, img_display, zona_atual_idx, coords_temp
#     zona_atual_idx = 0
#     coords_temp = {}

#     print(f"\n[INFO] A preparar visualização de {pdf_path}...")
#     try:
#         pages = convert_from_path(pdf_path, 200, poppler_path=POPPLER_PATH)
#         img_pil = pages[0]
#         img_original = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

#         h, w = img_original.shape[:2]
#         scale = 900 / h
#         img_original = cv2.resize(img_original, (int(w * scale), int(h * scale)))
#         img_display = img_original.copy()

#         cv2.namedWindow('Configurador Dinamico')
#         cv2.setMouseCallback('Configurador Dinamico', rato_callback)

#         print("\nINSTRUÇÕES:")
#         for i, zona in enumerate(LISTA_ZONAS):
#             print(f" {i+1}. Desenhe o retângulo para: {zona}")

#         while True:
#             cv2.imshow('Configurador Dinamico', img_display)
#             key = cv2.waitKey(1) & 0xFF

#             if zona_atual_idx >= len(LISTA_ZONAS):
#                 cv2.putText(img_display, "CONCLUIDO! Pressione 'S' para salvar.", (10, 80),
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

#             if key == ord('s') and zona_atual_idx >= len(LISTA_ZONAS):
#                 with open(CONFIG_FILE, 'w') as f:
#                     json.dump({"ordem": LISTA_ZONAS, "coords": coords_temp}, f, indent=4)
#                 print("[OK] Zonas guardadas no ficheiro.")
#                 break
#             elif key == ord('q'):
#                 return False

#         cv2.destroyAllWindows()
#         return True
#     except Exception as e:
#         print(f"[ERRO] {e}")
#         return False

# # ==========================================
# # PROCESSAMENTO IA (OLLAMA)
# # ==========================================

# def analisar_com_ollama(pil_img, nome_campo):
#     # Melhoria de imagem para OCR
#     img = ImageOps.grayscale(pil_img)
#     img = ImageEnhance.Contrast(img).enhance(2.0)

#     buffered = BytesIO()
#     img.save(buffered, format="PNG")
#     img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

#     # Prompt dinâmico baseado no nome do campo
#     prompt = (
#         f"Analisa esta imagem de uma fatura. O campo recortado é: {nome_campo}.\n"
#         "REGRAS:\n1. Extrai apenas o que vês impresso.\n2. Se for uma tabela, lista todos os itens.\n"
#         "3. NÃO inventes dados.\n4. Responde estritamente em JSON."
#     )

#     payload = {
#         "model": MODEL_VISION,
#         "prompt": prompt,
#         "stream": False,
#         "images": [img_b64],
#         "format": "json",
#         "options": {"temperature": 0.0}
#     }

#     try:
#         response = requests.post(OLLAMA_URL, json=payload, timeout=120)
#         return json.loads(response.json().get('response', '{}'))
#     except Exception as e:
#         return {"erro": str(e)}

# def executar_pipeline(pdf_path):
#     with open(CONFIG_FILE, 'r') as f:
#         data_config = json.load(f)

#     ordem_zonas = data_config["ordem"]
#     coords = data_config["coords"]

#     print(f"\n[1/2] A processar {pdf_path} em alta definição...")
#     pages = convert_from_path(pdf_path, 400, poppler_path=POPPLER_PATH)
#     full_img = pages[0]
#     w_f, h_f = full_img.size

#     final_json = {}

#     for nome in ordem_zonas:
#         c = coords[nome]
#         box = (c['x']*w_f, c['y']*h_f, (c['x']+c['w'])*w_f, (c['y']+c['h'])*h_f)
#         crop = full_img.crop(box)

#         print(f" -> IA a analisar zona: {nome}...")
#         final_json[nome] = analisar_com_ollama(crop, nome)

#     out_file = os.path.basename(pdf_path).replace(".pdf", "_extraido.json")
#     with open(out_file, 'w', encoding='utf-8') as f:
#         json.dump(final_json, f, indent=2, ensure_ascii=False)

#     print(f"\n[SUCESSO] Dados salvos em: {out_file}")
#     print(json.dumps(final_json, indent=2, ensure_ascii=False))

# # ==========================================
# # LOOP PRINCIPAL
# # ==========================================

# def main():
#     global LISTA_ZONAS
#     pdf_alvo = "original/5Q0060524.pdf"

#     if not os.path.exists(pdf_alvo):
#         print(f"Erro: Ficheiro não encontrado em {pdf_alvo}")
#         return

#     # Pergunta dinâmica ao utilizador
#     if not os.path.exists(CONFIG_FILE) or input("\nDeseja definir novas zonas para este cliente? (s/n): ").lower() == 's':
#         entrada = input("Quais as zonas a extrair? (separe por vírgulas, ex: Fornecedor, Cliente, Tabela, Totais): ")
#         LISTA_ZONAS = [z.strip() for z in entrada.split(",") if z.strip()]

#         if not LISTA_ZONAS:
#             print("Nenhuma zona definida. Abortando.")
#             return

#         if not definir_zonas_visual(pdf_alvo): return

#     executar_pipeline(pdf_alvo)

# if __name__ == "__main__":
#     main()


import cv2
import json
import os
import requests
import numpy as np
import base64
import pdfplumber
from pdf2image import convert_from_path
from PIL import Image
from io import BytesIO

# ==========================================
# CONFIGURAÇÃO
# ==========================================
OLLAMA_URL = "http://100.118.62.128:11434/api/generate"
MODEL_VISION = "llama3.2-vision:latest"
MODEL_JUDGE = "qwen2.5-coder:14b"
POPPLER_PATH = r"C:\Program Files\poppler\poppler-25.12.0\Library\bin" 
CONFIG_FILE = 'multi_layout_config.json'

# Globais para a GUI
ix, iy = -1, -1
desenhando = False
img_display = None
img_original = None
coords_sessao = {}
zona_atual_idx = 0
lista_campos_sessao = []

# ==========================================
# INTERFACE DE DESENHO (REUTILIZÁVEL)
# ==========================================

def rato_callback(event, x, y, flags, param):
    global ix, iy, desenhando, img_display, zona_atual_idx, coords_sessao
    if zona_atual_idx >= len(lista_campos_sessao): return
    if event == cv2.EVENT_LBUTTONDOWN:
        desenhando = True
        ix, iy = x, y
    elif event == cv2.EVENT_MOUSEMOVE and desenhando:
        img_display = img_original.copy()
        cv2.rectangle(img_display, (ix, iy), (x, y), (0, 255, 0), 2)
    elif event == cv2.EVENT_LBUTTONUP:
        desenhando = False
        h, w = img_original.shape[:2]
        x1, y1, x2, y2 = min(ix, x), min(iy, y), max(ix, x), max(iy, y)
        nome = lista_campos_sessao[zona_atual_idx]
        coords_sessao[nome] = {"x": x1/w, "y": y1/h, "w": (x2-x1)/w, "h": (y2-y1)/h}
        cv2.rectangle(img_original, (x1, y1), (x2, y2), (0, 255, 0), 2)
        img_display = img_original.copy()
        zona_atual_idx += 1

def capturar_layout_visual(pdf_path, num_pag, campos):
    global img_original, img_display, zona_atual_idx, coords_sessao, lista_campos_sessao
    zona_atual_idx = 0
    coords_sessao = {}
    lista_campos_sessao = campos
    
    pages = convert_from_path(pdf_path, 150, poppler_path=POPPLER_PATH, first_page=num_pag, last_page=num_pag)
    img_original = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)
    h, w = img_original.shape[:2]
    scale = 900 / h
    img_original = cv2.resize(img_original, (int(w * scale), int(h * scale)))
    img_display = img_original.copy()

    win_name = f"Definir Layout: Pagina {num_pag}"
    cv2.namedWindow(win_name)
    cv2.setMouseCallback(win_name, rato_callback)
    
    print(f"\n[GUI] Desenhe as zonas para: {campos}")
    while True:
        cv2.imshow(win_name, img_display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s') and zona_atual_idx >= len(lista_campos_sessao):
            break
    cv2.destroyWindow(win_name)
    return coords_sessao

# ==========================================
# LÓGICA DE IAs (OLLAMA)
# ==========================================

def perguntar_ollama(prompt, image_b64=None, model=MODEL_VISION):
    payload = {"model": model, "prompt": prompt, "stream": False, "format": "json", "options": {"temperature": 0}}
    if image_b64: payload["images"] = [image_b64]
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=180)
        return json.loads(r.json().get('response', '{}'))
    except: return {"erro": "Falha na IA"}

# ==========================================
# PIPELINE HÍBRIDA MULTI-PÁGINA
# ==========================================

def executar_pipeline(pdf_path):
    with open(CONFIG_FILE, 'r') as f:
        layouts = json.load(f)

    # Renderizar PDF para OCR (300 DPI)
    print("\n[1/3] Renderizando imagens para OCR...")
    pages_img = convert_from_path(pdf_path, 300, poppler_path=POPPLER_PATH)
    total_pags = len(pages_img)
    
    resultado_final = {"cabecalho": {}, "itens": [], "totais": {}}

    with pdfplumber.open(pdf_path) as pdf:
        for i, pagina in enumerate(pdf.pages):
            # Seleção de Layout
            if i == 0: 
                config = layouts['primeira']; tipo = "INICIAL"
            elif i == total_pags - 1: 
                config = layouts['ultima']; tipo = "FINAL"
            else: 
                config = layouts['meio']; tipo = "INTERMEDIA"

            print(f"\n[PAGINA {i+1}/{total_pags}] Usando layout {tipo}")
            
            p_w, p_h = float(pagina.width), float(pagina.height)
            img_p = pages_img[i]
            iw, ih = img_p.size

            for campo, c in config.items():
                # 1. Digital
                bbox_pdf = (c['x']*p_w, c['y']*p_h, (c['x']+c['w'])*p_w, (c['y']+c['h'])*p_h)
                digital_txt = pagina.within_bbox(bbox_pdf).extract_text() or ""
                
                # 2. Vision (OCR)
                crop = img_p.crop((c['x']*iw, c['y']*ih, (c['x']+c['w'])*iw, (c['y']+c['h'])*ih))
                buf = BytesIO(); crop.save(buf, format="PNG")
                img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                vision_json = perguntar_ollama(f"Extrai {campo} em JSON.", img_b64, MODEL_VISION)

                # 3. Juiz (Qwen) - Consolidação
                prompt_juri = f"Analisa os dados e cria um JSON consolidado.\nCAMPO: {campo}\nDIGITAL: {digital_txt}\nVISION: {json.dumps(vision_json)}"
                consolidado = perguntar_ollama(prompt_juri, None, MODEL_JUDGE)

                # Organização dos dados
                if "tabela" in campo.lower() or "lista" in campo.lower():
                    # Tenta extrair a lista de itens do JSON consolidado
                    itens = consolidado if isinstance(consolidado, list) else consolidado.get("itens", [])
                    resultado_final["itens"].extend(itens)
                elif i == 0:
                    resultado_final["cabecalho"][campo] = consolidado
                elif i == total_pags - 1:
                    resultado_final["totais"][campo] = consolidado

    # Salvar
    with open("resultado_mestre.json", "w", encoding="utf-8") as f:
        json.dump(resultado_final, f, indent=2, ensure_ascii=False)
    print("\n[SUCESSO] Processamento concluído: resultado_mestre.json")

# ==========================================
# MAIN
# ==========================================

def main():
    pdf_alvo = "original/5Q0060524.pdf"
    
    if not os.path.exists(CONFIG_FILE) or input("Redefinir TODOS os layouts? (s/n): ").lower() == 's':
        layouts = {}
        
        # 1. Layout Primeira Página
        campos_1 = input("Campos da 1ª Pág (ex: Empresa, Cliente, Tabela): ").split(",")
        layouts['primeira'] = capturar_layout_visual(pdf_alvo, 1, [c.strip() for c in campos_1])
        
        # 2. Layout Meio (usa a página 2 como modelo)
        campos_m = input("Campos das Págs do Meio (ex: Tabela): ").split(",")
        layouts['meio'] = capturar_layout_visual(pdf_alvo, 2, [c.strip() for c in campos_m])
        
        # 3. Layout Última Página
        with pdfplumber.open(pdf_alvo) as p: total = len(p.pages)
        campos_u = input("Campos da Última Pág (ex: Tabela, Totais): ").split(",")
        layouts['ultima'] = capturar_layout_visual(pdf_alvo, total, [c.strip() for c in campos_u])
        
        with open(CONFIG_FILE, 'w') as f: json.dump(layouts, f, indent=4)

    executar_pipeline(pdf_alvo)

if __name__ == "__main__":
    main()