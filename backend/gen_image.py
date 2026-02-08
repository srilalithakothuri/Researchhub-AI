import base64
from PIL import Image
import io

# Create a 100x100 white square
img = Image.new('RGB', (100, 100), color='white')
buffered = io.BytesIO()
img.save(buffered, format="PNG")
img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

print(img_str)
