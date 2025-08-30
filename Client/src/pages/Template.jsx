import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Template = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    rollNo: '', // Added roll number field
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

  // Enhanced prevention for copy-paste, mobile clipboard, and extensions
  const preventCopyPaste = (e) => {
    e.preventDefault();
    alert("Copy-paste is not allowed. Please type manually.");
    return false;
  };

  // Store the last known value for each field to detect unauthorized changes
  const [lastKnownValues, setLastKnownValues] = useState({});
  const [keystrokeTimestamps, setKeystrokeTimestamps] = useState({});

  // Enhanced input validation to prevent paste from clipboard/extensions
  const handleSecureInputChange = (e) => {
    const { name, value } = e.target;
    const previousValue = formData[name] || '';
    const currentTime = Date.now();
    
    // Check if this is a rapid large text insertion (likely paste)
    if (value.length - previousValue.length > 5) {
      const lastKeystroke = keystrokeTimestamps[name] || 0;
      const timeDiff = currentTime - lastKeystroke;
      
      // If large text change happened too quickly (less than 100ms per character)
      if (timeDiff < (value.length - previousValue.length) * 100) {
        alert("Rapid text insertion detected. Please type manually.");
        return;
      }
    }
    
    // Update keystroke timestamp
    setKeystrokeTimestamps(prev => ({
      ...prev,
      [name]: currentTime
    }));
    
    // Regular input change handler
    handleInputChange(e);
  };

  // Monitor input for unauthorized changes (catches extension-based inputs)
  const monitorInput = (e) => {
    const { name, value } = e.target;
    const lastValue = lastKnownValues[name] || '';
    
    // If value changed without a keystroke (extension input)
    if (value !== lastValue && !e.isTrusted) {
      alert("Unauthorized input detected. Please type manually.");
      e.target.value = lastValue;
      setFormData(prev => ({ ...prev, [name]: lastValue }));
      return;
    }
    
    // Update last known value
    setLastKnownValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Additional mobile-specific paste prevention
  const handleMobileInput = (e) => {
    // Prevent context menu on mobile (long press)
    e.preventDefault();
  };

  // Comprehensive input event handler
  const handleInputEvent = (e) => {
    // Detect if input was inserted programmatically
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
      e.preventDefault();
      alert("Paste operation blocked. Please type manually.");
      return;
    }
    
    // Check for composition events (some mobile keyboards/extensions)
    if (e.inputType && e.inputType.includes('insert') && !e.inputType.includes('Char')) {
      const insertedText = e.data || '';
      if (insertedText.length > 3) {
        alert("Large text insertion blocked. Please type manually.");
        e.preventDefault();
        return;
      }
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update last known values for monitoring
    setLastKnownValues(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    if (!formData.rollNo) newErrors.rollNo = "Roll number is required";
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

  // Generate PDF from form data with border and header box
  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const borderMargin = 5; // 5mm  border margin
      const contentMargin = 20; // 20mm content margin from border
      const contentWidth = pageWidth - (2 * (borderMargin + contentMargin));
      
      // Function to add border to each page
      const addPageBorder = () => {
        // Add border around the page
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(borderMargin, borderMargin, pageWidth - (2 * borderMargin), pageHeight - (2 * borderMargin));
      };
      
      // Function to add footer with page number and roll number
      const addFooter = (pageNum) => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        
        // Add roll number on left side of footer
        pdf.text(`Roll No: ${formData.rollNo}`, borderMargin + 5, pageHeight - (borderMargin + 5));
        
        // Add page number on right side of footer with proper alignment
        const pageText = `Page ${pageNum}`;
        pdf.text(pageText, pageWidth - (borderMargin + 15), pageHeight - (borderMargin + 5));
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
      pdf.setTextColor(0, 0, 0); // Set text color to black (RGB: 0,0,0)
      pdf.text("Aim:", leftMargin, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 7;
      
      // Handle multiline text wrapping
      const splitAim = pdf.splitTextToSize(formData.aim, contentWidth);
      pdf.text(splitAim, leftMargin, yPos);
      yPos += splitAim.length * 7 + 10;
      
      // Procedure
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0); // Set text color to black (RGB: 0,0,0)
      pdf.text("Procedure:", leftMargin, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 7;
      
      const splitProcedure = pdf.splitTextToSize(formData.procedure, contentWidth);
      pdf.text(splitProcedure, leftMargin, yPos);
      yPos += splitProcedure.length * 7 + 10;
      
      // Program Images
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0); // Set text color to black (RGB: 0,0,0)
      pdf.text("Program:", leftMargin, yPos);
      yPos += 7;
      
      // Track page count
      let currentPage = 1;
      
      // Add multiple program images with their actual dimensions
      for (let i = 0; i < programImages.length; i++) {
        // Create temporary image to get original dimensions
        const img = new Image();
        img.src = programImages[i];
        
        // Use original image dimensions (converted from pixels to mm)
        // Standard conversion: 1 pixel ≈ 0.264583 mm
        const pxToMm = 0.264583;
        const imgWidth = img.width * pxToMm;
        const imgHeight = img.height * pxToMm;
        
        // If image is wider than content width, scale it down to fit the page
        let finalImgWidth = imgWidth;
        let finalImgHeight = imgHeight;
        if (imgWidth > contentWidth) {
          finalImgWidth = contentWidth;
          finalImgHeight = (imgHeight * contentWidth) / imgWidth;
        }
        
        // Check if we need a new page
        if (yPos + finalImgHeight > pageHeight - borderMargin - contentMargin) {
          addFooter(currentPage); // Add footer to current page before adding a new one
          pdf.addPage();
          currentPage++;
          addPageBorder(); // Add only border to new page
          yPos = borderMargin + contentMargin; // Start content after border margin
        }
        
        // Calculate horizontal centering if image is smaller than content width
        const xOffset = finalImgWidth < contentWidth ? (contentWidth - finalImgWidth) / 2 : 0;
        
        pdf.addImage(programImages[i], 'JPEG', leftMargin + xOffset, yPos, finalImgWidth, finalImgHeight);
        yPos += finalImgHeight + 5; // Add a small space after image
      }
      
      // Output Images
      pdf.setFontSize(12); // Match Aim section font size
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0); // Set text color to black (RGB: 0,0,0)
      
      // Check if we need a new page for output
      if (yPos > pageHeight - borderMargin - contentMargin - 60) {
        addFooter(currentPage); // Add footer to current page
        pdf.addPage();
        currentPage++;
        addPageBorder(); // Add only border to new page
        yPos = borderMargin + contentMargin; // Start content after border margin
      }
      
      pdf.text("Output:", leftMargin, yPos);
      yPos += 7;
      pdf.setTextColor(0, 0, 0); // Keep text color black for content
      
      // Add multiple output images with their actual dimensions
      for (let i = 0; i < outputImages.length; i++) {
        // Create temporary image to get original dimensions
        const img = new Image();
        img.src = outputImages[i];
        
        // Use original image dimensions (converted from pixels to mm)
        // Standard conversion: 1 pixel ≈ 0.264583 mm
        const pxToMm = 0.264583;
        const imgWidth = img.width * pxToMm;
        const imgHeight = img.height * pxToMm;
        
        // If image is wider than content width, scale it down to fit the page
        let finalImgWidth = imgWidth;
        let finalImgHeight = imgHeight;
        if (imgWidth > contentWidth) {
          finalImgWidth = contentWidth;
          finalImgHeight = (imgHeight * contentWidth) / imgWidth;
        }
        
        // Check if we need a new page
        if (yPos + finalImgHeight > pageHeight - borderMargin - contentMargin) {
          addFooter(currentPage); // Add footer to current page
          pdf.addPage();
          currentPage++;
          addPageBorder(); // Add only border to new page
          yPos = borderMargin + contentMargin; // Start content after border margin
        }
        
        // Calculate horizontal centering if image is smaller than content width
        const xOffset = finalImgWidth < contentWidth ? (contentWidth - finalImgWidth) / 2 : 0;
        
        pdf.addImage(outputImages[i], 'JPEG', leftMargin + xOffset, yPos, finalImgWidth, finalImgHeight);
        yPos += finalImgHeight + 5; // Add a small space after image
      }
      
      // Calculate space needed for result text
      const splitResult = pdf.splitTextToSize(formData.result, contentWidth);
      
      const resultHeight = splitResult.length * 7 + 10;
      
      // Check if we need a new page or if we can fit result at bottom of current page
      const remainingSpace = pageHeight - (borderMargin + contentMargin) - yPos;
      
      // If not enough space on current page OR we just want result to be at bottom of page
      // We'll start a new page and position the result at the bottom
      addFooter(currentPage); // Add footer to current page
      pdf.addPage();
      currentPage++;
      addPageBorder(); // Add border to new page
      
      // Position result at the bottom of the page
      let resultYPos = pageHeight - borderMargin - contentMargin - resultHeight;
      
      // If result is too large to fit at bottom, position it at top with reasonable margin
      if (resultHeight > pageHeight * 0.6) {
        resultYPos = borderMargin + contentMargin;
      }
      
      // Result title
      pdf.setFontSize(12); // Setting the same font size as Aim section
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0); // Set text color to black (RGB: 0,0,0)
      pdf.text("Result:", leftMargin, resultYPos);
      pdf.setFont('helvetica', 'normal');
      resultYPos += 7;
      
      // Result content
      pdf.text(splitResult, leftMargin, resultYPos);
      
      // Add footer to result page
      addFooter(currentPage);
      
      // Save PDF
      pdf.save(`Experiment_${formData.rollNo}_${formData.expNo}.pdf`);
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
      rollNo: '',
      expNo: '',
      expTitle: '',
      aim: '',
      procedure: '',
      result: ''
    });
    setProgramImages([]);
    setOutputImages([]);
    setErrors({});
    setLastKnownValues({});
    setKeystrokeTimestamps({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-white text-2xl font-bold">Create New Record</h1>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Roll Number - New field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                className={`w-full px-4 py-2 border ${errors.rollNo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your roll number"
                autoComplete="off"
                spellCheck="false"
                required
              />
              {errors.rollNo && (
                <p className="mt-1 text-sm text-red-600">{errors.rollNo}</p>
              )}
            </div>
            
            {/* Experiment Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experiment Number
              </label>
              <input
                type="text"
                name="expNo"
                value={formData.expNo}
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                className={`w-full px-4 py-2 border ${errors.expNo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter experiment number"
                autoComplete="off"
                spellCheck="false"
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
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                className={`w-full px-4 py-2 border ${errors.expTitle ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter experiment title"
                autoComplete="off"
                spellCheck="false"
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
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.aim ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter the aim of the experiment"
                autoComplete="off"
                spellCheck="false"
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
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                rows="5"
                className={`w-full px-4 py-2 border ${errors.procedure ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe the procedure step by step"
                autoComplete="off"
                spellCheck="false"
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
                onChange={handleSecureInputChange}
                onInput={handleInputEvent}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                onCut={preventCopyPaste}
                onDrop={preventCopyPaste}
                onDragOver={preventCopyPaste}
                onContextMenu={handleMobileInput}
                onCompositionStart={monitorInput}
                onCompositionEnd={monitorInput}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.result ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe the result of the experiment"
                autoComplete="off"
                spellCheck="false"
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