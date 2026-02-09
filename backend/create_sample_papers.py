import os
from fpdf import FPDF

# Create sample research PDFs for testing
def create_sample_pdf(filename, title, authors, abstract, content, category):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font('helvetica', 'B', 16)
    pdf.multi_cell(0, 10, title)
    pdf.ln(5)
    
    # Authors
    pdf.set_font('helvetica', 'I', 11)
    pdf.multi_cell(0, 6, f"Authors: {authors}")
    pdf.ln(3)
    
    # Category
    pdf.set_font('helvetica', '', 10)
    pdf.multi_cell(0, 6, f"Category: {category}")
    pdf.ln(5)
    
    # Abstract
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, "Abstract")
    pdf.ln(8)
    pdf.set_font('helvetica', '', 10)
    pdf.multi_cell(0, 6, abstract)
    pdf.ln(5)
    
    # Content
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, "Introduction")
    pdf.ln(8)
    pdf.set_font('helvetica', '', 10)
    pdf.multi_cell(0, 6, content)
    
    # Save
    os.makedirs('sample_papers', exist_ok=True)
    pdf.output(f'sample_papers/{filename}')
    print(f"Created: sample_papers/{filename}")

# AI/Machine Learning Papers
create_sample_pdf(
    "deep_learning_nlp.pdf",
    "Advances in Deep Learning for Natural Language Processing",
    "Smith, J., Johnson, A., Williams, R.",
    "This paper explores recent advances in deep learning architectures for natural language processing tasks. We present a comprehensive survey of transformer-based models and their applications in text classification, machine translation, and question answering systems.",
    "Natural language processing has seen remarkable progress with the advent of deep learning. Transformer architectures, introduced by Vaswani et al., have revolutionized the field. These models use self-attention mechanisms to capture long-range dependencies in text. Pre-trained language models like BERT and GPT have achieved state-of-the-art results across numerous NLP benchmarks. Fine-tuning these models on downstream tasks has become the standard approach. Recent work has focused on scaling these models to billions of parameters, leading to emergent capabilities in few-shot learning and reasoning.",
    "Machine Learning"
)

create_sample_pdf(
    "computer_vision_detection.pdf",
    "Real-Time Object Detection Using Convolutional Neural Networks",
    "Chen, L., Rodriguez, M., Kim, S.",
    "We propose a novel real-time object detection framework based on convolutional neural networks. Our approach achieves superior accuracy while maintaining high inference speed, making it suitable for autonomous driving and robotics applications.",
    "Object detection is a fundamental computer vision task with applications in autonomous vehicles, surveillance, and robotics. Traditional methods relied on hand-crafted features and sliding window approaches. Modern deep learning methods, particularly CNNs, have dramatically improved detection accuracy. YOLO and Faster R-CNN represent two major paradigms: single-stage and two-stage detectors. Our work builds upon these foundations, introducing architectural improvements that balance speed and accuracy. We demonstrate state-of-the-art performance on COCO and Pascal VOC datasets.",
    "Artificial Intelligence"
)

# Climate Science Papers
create_sample_pdf(
    "climate_modeling.pdf",
    "High-Resolution Climate Modeling for Regional Impact Assessment",
    "Anderson, K., Martinez, P., Thompson, E.",
    "This study presents a high-resolution climate model for assessing regional impacts of global warming. We analyze temperature and precipitation patterns across different geographical regions and project future climate scenarios under various emission pathways.",
    "Climate change poses significant challenges to ecosystems and human societies. Accurate regional climate projections are essential for adaptation planning. Global climate models provide valuable insights but often lack the spatial resolution needed for local impact assessment. We developed a regional climate model with 10km resolution, downscaling from global models. Our simulations incorporate detailed topography, land use, and ocean-atmosphere interactions. Results indicate significant regional variations in warming patterns and precipitation changes. Coastal regions show particular vulnerability to sea-level rise and extreme weather events.",
    "Climate Science"
)

create_sample_pdf(
    "carbon_sequestration.pdf",
    "Forest Carbon Sequestration Potential in Tropical Ecosystems",
    "Green, D., Silva, R., Nguyen, T.",
    "We quantify the carbon sequestration potential of tropical forests and examine the role of reforestation in climate mitigation strategies. Our analysis combines satellite data with ground measurements to estimate carbon storage capacity.",
    "Tropical forests play a crucial role in the global carbon cycle, storing approximately 25% of terrestrial carbon. Deforestation releases this stored carbon, contributing to atmospheric CO2 concentrations. Conversely, reforestation and afforestation can sequester significant amounts of carbon. We used remote sensing data from Landsat and MODIS satellites to map forest cover changes over two decades. Field measurements provided ground truth for biomass estimates. Our results show that protecting existing forests and restoring degraded lands could sequester 10-15 gigatons of CO2 annually, representing a major natural climate solution.",
    "Climate Science"
)

# Medical Research Papers
create_sample_pdf(
    "cancer_immunotherapy.pdf",
    "Novel Immunotherapy Approaches for Metastatic Cancer Treatment",
    "Brown, M., Lee, H., Patel, A.",
    "This research investigates novel immunotherapy strategies for treating metastatic cancers. We present clinical trial results demonstrating improved patient outcomes through combination therapies targeting multiple immune checkpoints.",
    "Cancer immunotherapy has transformed oncology by harnessing the immune system to fight tumors. Checkpoint inhibitors like anti-PD-1 and anti-CTLA-4 antibodies have shown remarkable efficacy in melanoma and lung cancer. However, many patients do not respond to single-agent therapy. Our clinical trial evaluated combination immunotherapy in 200 patients with metastatic solid tumors. The combination of PD-1 and CTLA-4 blockade achieved a 45% objective response rate, significantly higher than historical controls. Biomarker analysis revealed that tumor mutational burden and PD-L1 expression predicted response. These findings support the use of combination immunotherapy in selected patient populations.",
    "Medical Research"
)

create_sample_pdf(
    "alzheimers_biomarkers.pdf",
    "Early Detection of Alzheimer's Disease Through Blood-Based Biomarkers",
    "Wilson, S., Garcia, F., Zhang, Y.",
    "We identify novel blood-based biomarkers for early detection of Alzheimer's disease. Our longitudinal study demonstrates that these biomarkers can predict cognitive decline years before clinical symptoms appear.",
    "Alzheimer's disease affects millions worldwide, with limited treatment options. Early detection is crucial for intervention but currently relies on expensive brain imaging or invasive CSF sampling. Blood-based biomarkers offer a more accessible alternative. We conducted a 5-year longitudinal study of 500 participants, measuring plasma levels of amyloid-beta, tau, and neurofilament light chain. Machine learning models combining these biomarkers achieved 85% accuracy in predicting progression to Alzheimer's dementia. Participants with elevated biomarkers showed cognitive decline 3-5 years before clinical diagnosis. These findings suggest blood tests could enable population-level screening for Alzheimer's risk.",
    "Medical Research"
)

print("\n✅ Successfully created 6 sample research PDFs in 'sample_papers/' directory")
print("\nCategories:")
print("- Machine Learning (1 paper)")
print("- Artificial Intelligence (1 paper)")
print("- Climate Science (2 papers)")
print("- Medical Research (2 papers)")
print("\nYou can now upload these files to test the AI organization features!")
