import os
import pypdfium2 as pdfium
from PIL import Image
from surya.foundation import FoundationPredictor
from surya.table_rec import TableRecPredictor
from surya.recognition import RecognitionPredictor
from surya.detection import DetectionPredictor

def test_full_extraction(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print("--- Initializing Surya Suite (v0.17+ Architecture) ---")
    
    # 1. The NEW missing piece: Foundation Predictor
    foundation_predictor = FoundationPredictor()
    
    # 2. Recognition now requires this specific foundation class
    rec_predictor = RecognitionPredictor(foundation_predictor) 
    
    # 3. Detection and Table predictors run independently
    det_predictor = DetectionPredictor()
    table_predictor = TableRecPredictor()

    # Render PDF (Page 1)
    pdf = pdfium.PdfDocument(file_path)
    img = pdf[0].render(scale=2).to_pil()

    print("--- Running Inference (Table + Text) ---")
    [table_res] = table_predictor([img])
    
    # We pass det_predictor here because the Recognition pipeline still 
    # needs it to find the bounding boxes before reading the text
    [rec_res] = rec_predictor([img], [["pt"]], det_predictor)

    print(f"\n--- Extracted Data ---")
    
    # Map text to table cells
    for cell in table_res.cells:
        cell_text = ""
        c_box = cell.bbox
        
        for line in rec_res.text_lines:
            l_box = line.bbox
            mid_x, mid_y = (l_box[0] + l_box[2]) / 2, (l_box[1] + l_box[3]) / 2
            
            # Spatial check: Is the text center inside the cell?
            if c_box[0] <= mid_x <= c_box[2] and c_box[1] <= mid_y <= c_box[3]:
                cell_text += line.text + " "
        
        # Only print cells that actually have text
        clean_text = cell_text.strip()
        if clean_text:
            print(f"Row {cell.row_id}, Col {cell.col_id} | {clean_text}")

if __name__ == "__main__":
    TEST_FILE = r"original\5Q0060524.pdf"
    test_full_extraction(TEST_FILE)