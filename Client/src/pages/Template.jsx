import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Template = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    expNo: '',
    expTitle: '',
    aim: '',
    procedure: '',
    result: ''
  });
  
  // State for image uploads - now arrays to handle multiple images
  const [programImages, setProgramImages] = useState([]);
  const [outputImages, setOutputImages] = useState([]);
  
  // State for form validation and submission
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // References to form elements
  const formRef = useRef(null);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Prevent copy-paste for text inputs
  const preventCopyPaste = (e) => {
    e.preventDefault();
    alert("Copy-paste is not allowed. Please type manually.");
    return false;
  };

  // Handle multiple image uploads
  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Process each file
    const validFiles = [];
    let hasErrors = false;
    
    files.forEach(file => {
      // Validate file is an image
      if (!file.type.match('image.*')) {
        alert(`File "${file.name}" is not an image. Please upload only image files.`);
        hasErrors = true;
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB limit.`);
        hasErrors = true;
        return;
      }
      
      validFiles.push(file);
    });
    
    if (hasErrors) {
      e.target.value = '';
      return;
    }
    
    // Process valid files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(loadEvent) {
        if (type === 'program') {
          setProgramImages(prev => [...prev, loadEvent.target.result]);
        } else {
          setOutputImages(prev => [...prev, loadEvent.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  // Remove an image from the collection
  const removeImage = (index, type) => {
    if (type === 'program') {
      setProgramImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setOutputImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.expNo) newErrors.expNo = "Experiment number is required";
    if (!formData.expTitle) newErrors.expTitle = "Experiment title is required";
    if (!formData.aim) newErrors.aim = "Aim is required";
    if (!formData.procedure) newErrors.procedure = "Procedure is required";
    if (!formData.result) newErrors.result = "Result is required";
    if (programImages.length === 0) newErrors.programImages = "At least one program image is required";
    if (outputImages.length === 0) newErrors.outputImages = "At least one output image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      // Here you would typically send data to your backend
      // For this example, we'll just generate the PDF
      generatePDF();
    }
  };

  // Generate PDF from form data
// Generate PDF from form data with border and header box
// Generate PDF from form data with border and header box
const generatePDF = async () => {
  setIsGeneratingPdf(true);
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const borderMargin = 10; // 10mm border margin
    const contentMargin = 20; // 20mm content margin from border
    const contentWidth = pageWidth - (2 * (borderMargin + contentMargin));
    
    // Function to add border to each page
    const addPageBorder = () => {
      // Add border around the page
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(borderMargin, borderMargin, pageWidth - (2 * borderMargin), pageHeight - (2 * borderMargin));
    };
    
    // Function to add header box (only for first page)
    const addHeaderBox = () => {
      // Header box - 40px (≈14mm) from top of border, 90% width, centered
      const headerBoxY = borderMargin + 14;
      const headerBoxWidth = (pageWidth - (2 * borderMargin)) * 0.9;
      const headerBoxX = (pageWidth - headerBoxWidth) / 2;
      const headerBoxHeight = 20; // 20mm height for header box
      
      // Draw header box border
      pdf.rect(headerBoxX, headerBoxY, headerBoxWidth, headerBoxHeight);
      
      // Left section (15% of header box width) for Exp.No and Date
      const leftSectionWidth = headerBoxWidth * 0.15;
      const rightSectionX = headerBoxX + leftSectionWidth;
      const rightSectionWidth = headerBoxWidth * 0.85;
      
      // Draw vertical line to separate left and right sections
      pdf.line(rightSectionX, headerBoxY, rightSectionX, headerBoxY + headerBoxHeight);
      
      // Draw horizontal line in left section to separate Exp.No and Date
      const leftSectionMidY = headerBoxY + (headerBoxHeight / 2);
      pdf.line(headerBoxX, leftSectionMidY, rightSectionX, leftSectionMidY);
      
      // Add text in left section
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Exp.No text (top half of left section)
      const expNoY = headerBoxY + 6;
      pdf.text(`Exp.No: ${formData.expNo}`, headerBoxX + 2, expNoY);
      
      // Date text (bottom half of left section) - empty value
      const dateY = leftSectionMidY + 6;
      pdf.text("Date:", headerBoxX + 2, dateY);
      
      // Title text (right section) - bold and centered
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const titleY = headerBoxY + (headerBoxHeight / 2) + 2;
      const titleText = pdf.splitTextToSize(formData.expTitle, rightSectionWidth - 4);
      
      // Center the title text
      const titleX = rightSectionX + (rightSectionWidth / 2);
      pdf.text(titleText, titleX, titleY, { align: "center", maxWidth: rightSectionWidth - 4 });
      
      return headerBoxY + headerBoxHeight + 10; // Return Y position after header
    };
    
    // Add border and header to first page only
    addPageBorder();
    let yPos = addHeaderBox();
    const leftMargin = borderMargin + contentMargin;
    
    // Add main content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Aim
    pdf.setFont('helvetica', 'bold');
    pdf.text("Aim:", leftMargin, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 7;
    
    // Handle multiline text wrapping
    const splitAim = pdf.splitTextToSize(formData.aim, contentWidth);
    pdf.text(splitAim, leftMargin, yPos);
    yPos += splitAim.length * 7 + 10;
    
    // Procedure
    pdf.setFont('helvetica', 'bold');
    pdf.text("Procedure:", leftMargin, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 7;
    
    const splitProcedure = pdf.splitTextToSize(formData.procedure, contentWidth);
    pdf.text(splitProcedure, leftMargin, yPos);
    yPos += splitProcedure.length * 7 + 10;
    
    // Program Images
    pdf.setFont('helvetica', 'bold');
    pdf.text("Program:", leftMargin, yPos);
    yPos += 7;
    
    // Add multiple program images with fixed width and dynamic height
    for (let i = 0; i < programImages.length; i++) {
      // Create temporary image to get dimensions
      const img = new Image();
      img.src = programImages[i];
      
      // Calculate height while maintaining aspect ratio
      const imgWidth = contentWidth;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      // Check if we need a new page
      if (yPos + imgHeight > pageHeight - borderMargin - contentMargin) {
        pdf.addPage();
        addPageBorder(); // Add only border to new page
        yPos = borderMargin + contentMargin; // Start content after border margin
      }
      
      pdf.addImage(programImages[i], 'JPEG', leftMargin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 5;
      
      // Add image number if there are multiple images
      if (programImages.length > 1) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Image ${i + 1}/${programImages.length}`, pageWidth/2, yPos, { align: "center" });
        yPos += 10;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
      }
    }
    
    // Output Images
    pdf.setFont('helvetica', 'bold');
    
    // Check if we need a new page for output
    if (yPos > pageHeight - borderMargin - contentMargin - 60) {
      pdf.addPage();
      addPageBorder(); // Add only border to new page
      yPos = borderMargin + contentMargin; // Start content after border margin
    }
    
    pdf.text("Output:", leftMargin, yPos);
    yPos += 7;
    
    // Add multiple output images with fixed width and dynamic height
    for (let i = 0; i < outputImages.length; i++) {
      // Create temporary image to get dimensions
      const img = new Image();
      img.src = outputImages[i];
      
      // Calculate height while maintaining aspect ratio
      const imgWidth = contentWidth;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      // Check if we need a new page
      if (yPos + imgHeight > pageHeight - borderMargin - contentMargin) {
        pdf.addPage();
        addPageBorder(); // Add only border to new page
        yPos = borderMargin + contentMargin; // Start content after border margin
      }
      
      pdf.addImage(outputImages[i], 'JPEG', leftMargin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 5;
      
      // Add image number if there are multiple images
      if (outputImages.length > 1) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Image ${i + 1}/${outputImages.length}`, pageWidth/2, yPos, { align: "center" });
        yPos += 10;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
      }
    }
    
    // Always put Result on a new page at the end
    pdf.addPage();
    addPageBorder(); // Add only border to new page
    yPos = borderMargin + contentMargin; // Start content after border margin
    
    // Result
    pdf.setFont('helvetica', 'bold');
    pdf.text("Result:", leftMargin, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 7;
    
    const splitResult = pdf.splitTextToSize(formData.result, contentWidth);
    pdf.text(splitResult, leftMargin, yPos);
    
    // Save PDF
    pdf.save(`Experiment_${formData.expNo}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  } finally {
    setIsGeneratingPdf(false);
    setIsSubmitting(false);
  }
};

  // Reset form
  const resetForm = () => {
    setFormData({
      expNo: '',
      expTitle: '',
      aim: '',
      procedure: '',
      result: ''
    });
    setProgramImages([]);
    setOutputImages([]);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-white text-2xl font-bold">Create New Record</h1>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Experiment Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experiment Number
              </label>
              <input
                type="text"
                name="expNo"
                value={formData.expNo}
                onChange={handleInputChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={`w-full px-4 py-2 border ${errors.expNo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter experiment number"
                required
              />
              {errors.expNo && (
                <p className="mt-1 text-sm text-red-600">{errors.expNo}</p>
              )}
            </div>
            
            {/* Experiment Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experiment Title
              </label>
              <input
                type="text"
                name="expTitle"
                value={formData.expTitle}
                onChange={handleInputChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={`w-full px-4 py-2 border ${errors.expTitle ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter experiment title"
                required
              />
              {errors.expTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.expTitle}</p>
              )}
            </div>
            
            {/* Aim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aim
              </label>
              <textarea
                name="aim"
                value={formData.aim}
                onChange={handleInputChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.aim ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter the aim of the experiment"
                required
              ></textarea>
              {errors.aim && (
                <p className="mt-1 text-sm text-red-600">{errors.aim}</p>
              )}
            </div>
            
            {/* Procedure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedure
              </label>
              <textarea
                name="procedure"
                value={formData.procedure}
                onChange={handleInputChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                rows="5"
                className={`w-full px-4 py-2 border ${errors.procedure ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe the procedure step by step"
                required
              ></textarea>
              {errors.procedure && (
                <p className="mt-1 text-sm text-red-600">{errors.procedure}</p>
              )}
            </div>
            
            {/* Program (Multiple Image Upload) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="program-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="program-upload"
                        name="program-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => handleImageUpload(e, 'program')}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>
              
              {/* Display uploaded program images with preview */}
              {programImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {programImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Program image ${index + 1}`} 
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index, 'program')}
                          className="p-1 bg-red-500 text-white rounded-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded-b-md">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.programImages && (
                <p className="mt-1 text-sm text-red-600">{errors.programImages}</p>
              )}
            </div>
            
            {/* Output (Multiple Image Upload) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output
              </label>
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="output-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="output-upload"
                        name="output-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => handleImageUpload(e, 'output')}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>
              
              {/* Display uploaded output images with preview */}
              {outputImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {outputImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Output image ${index + 1}`} 
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index, 'output')}
                          className="p-1 bg-red-500 text-white rounded-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded-b-md">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.outputImages && (
                <p className="mt-1 text-sm text-red-600">{errors.outputImages}</p>
              )}
            </div>
            
            {/* Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result
              </label>
              <textarea
                name="result"
                value={formData.result}
                onChange={handleInputChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.result ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe the result of the experiment"
                required
              ></textarea>
              {errors.result && (
                <p className="mt-1 text-sm text-red-600">{errors.result}</p>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting || isGeneratingPdf}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGeneratingPdf}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isGeneratingPdf ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </div>
                ) : (
                  "Generate Record PDF"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Template;