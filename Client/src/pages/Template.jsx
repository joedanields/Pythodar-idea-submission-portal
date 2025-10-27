import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Import your logos from assets folder
// Adjust the path as needed depending on where your logo is stored
import logo from '../assets/col-kitelogo-removebg-preview2.jpg'; // Updated college logo path
import pyExpoLogo from '../assets/PyExpoLogo.svg'; // Add this new import for Python Expo logo
import techCommunityLogo from '../assets/ips.webp'; // Change this path to match your actual logo location
import splitupTable from '../assets/splitup.png'; // Import the splitup table image

const Template = () => {
  // Maximum number of ideas that can be submitted - CHANGE THIS VALUE TO SET LIMIT
  const MAX_IDEAS = 1; // Set your desired maximum here
  
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    registrationNo: '',
    department: '',
  });
  
  // State for ideas - only 1 idea
  const [ideas, setIdeas] = useState([
    { id: 1, title: '', description: '' }
  ]);
  
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

  // Handle idea input changes
  const handleIdeaChange = (id, field, value) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, [field]: value } : idea
    ));
  };

  // Add new idea field (disabled for single idea)
  const addIdea = () => {
    // Disabled - only one idea allowed
    return;
  };

  // Remove an idea field (disabled for single idea)
  const removeIdea = (id) => {
    // Disabled - only one idea allowed
    return;
  };

  // Prevent copy-paste for text inputs
  const preventCopyPaste = (e) => {
    e.preventDefault();
    alert("Copy-paste is not allowed. Please type manually.");
    return false;
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.rollNo) newErrors.rollNo = "Roll number is required";
    if (!formData.registrationNo) newErrors.registrationNo = "Registration number is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    // Validate ideas
    ideas.forEach((idea, index) => {
      if (!idea.title) newErrors[`ideaTitle${idea.id}`] = "Idea title is required";
      if (!idea.description) newErrors[`ideaDescription${idea.id}`] = "Idea description is required";
    });
    
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
  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Add border to page
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Add logos using canvas conversion for better compatibility
      const loadImageAsDataURL = (imageSrc) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = imageSrc;
        });
      };

      try {
        // Load all logos as data URLs
        const [collegeLogoData, pyExpoLogoData, ipsLogoData] = await Promise.all([
          loadImageAsDataURL(logo),
          loadImageAsDataURL(pyExpoLogo),
          loadImageAsDataURL(techCommunityLogo)
        ]);

        // Top-left: College logo (enlarged and properly positioned in corner)
        pdf.addImage(collegeLogoData, 'PNG', 8, 8, 35, 25);
        
        // Top-right: PyExpo logo (properly positioned in corner)
        pdf.addImage(pyExpoLogoData, 'PNG', pageWidth - 33, 8, 25, 25);
        
        // Bottom-right: IPS logo
        pdf.addImage(ipsLogoData, 'PNG', pageWidth - margin - 15, pageHeight - 25, 15, 15);
      } catch (logoError) {
        console.log('Logo loading error:', logoError);
        // Continue without logos if there's an error
      }
      
      let yPos = margin + 35; // Adjusted to account for enlarged top logos
      
      // Title: PYTHODAR
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 139); // Dark blue
      pdf.text('PYTHODAR', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Idea Submission Portal', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Personal Details - Better aligned layout
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const leftCol = margin;
      const rightCol = pageWidth / 2 + 10;
      const lineHeight = 8;
      const labelWidth = 40; // Fixed width for labels to ensure alignment
      
      // Left column - Name
      pdf.setFont('helvetica', 'bold');
      pdf.text('Name:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.name, leftCol + labelWidth, yPos);
      
      // Right column - Roll No
      pdf.setFont('helvetica', 'bold');
      pdf.text('Roll No:', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.rollNo, rightCol + labelWidth, yPos);
      yPos += lineHeight;
      
      // Left column - Registration No
      pdf.setFont('helvetica', 'bold');
      pdf.text('Registration No:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.registrationNo, leftCol + labelWidth, yPos);
      
      // Right column - Department
      pdf.setFont('helvetica', 'bold');
      pdf.text('Department:', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.department, rightCol + labelWidth, yPos);
      yPos += lineHeight + 10;
      
      // Ideas Table
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Submitted Idea:', leftCol, yPos);
      yPos += 8;
      
      // Table headers - removed checkbox column
      const tableStartY = yPos;
      const colWidths = [15, 70, 100]; // Idea No, Title, Description (no Selected column)
      const tableX = leftCol;
      let currentX = tableX;
      
      // Set styles for header
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.setFillColor(240, 240, 240); // Very light gray background
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0); // Black text
      
      // Draw header row - draw rectangles first, then add text
      // Column 1: No.
      pdf.rect(currentX, yPos, colWidths[0], 10, 'S'); // S = Stroke only (border only)
      pdf.text('No.', currentX + colWidths[0] / 2, yPos + 6.5, { align: 'center' });
      currentX += colWidths[0];
      
      // Column 2: Idea Title
      pdf.rect(currentX, yPos, colWidths[1], 10, 'S');
      pdf.text('Idea Title', currentX + 2, yPos + 6.5);
      currentX += colWidths[1];
      
      // Column 3: Idea Description
      pdf.rect(currentX, yPos, colWidths[2], 10, 'S');
      pdf.text('Idea Description', currentX + 2, yPos + 6.5);
      
      yPos += 10;
      
      // Draw idea rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0); // Ensure black text color for content
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(0, 0, 0); // Black border
      
      ideas.forEach((idea, index) => {
        currentX = tableX;
        
        // Calculate dynamic row height based on content
        const titleLines = pdf.splitTextToSize(idea.title, colWidths[1] - 4);
        const descLines = pdf.splitTextToSize(idea.description, colWidths[2] - 4);
        
        // Calculate height needed for text (line height is approximately 4mm)
        const titleHeight = titleLines.length * 4;
        const descHeight = descLines.length * 4;
        const minRowHeight = 15; // Minimum height for readability
        const padding = 6; // Top and bottom padding
        
        // Use the maximum height needed plus padding
        const rowHeight = Math.max(minRowHeight, Math.max(titleHeight, descHeight) + padding);
        
        // Check if we need a new page
        if (yPos + rowHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
          yPos = margin;
        }
        
        // Idea Number
        pdf.rect(currentX, yPos, colWidths[0], rowHeight, 'S'); // S = Stroke only
        pdf.text((index + 1).toString(), currentX + colWidths[0] / 2, yPos + rowHeight / 2, { align: 'center' });
        currentX += colWidths[0];
        
        // Idea Title - wrap text
        pdf.rect(currentX, yPos, colWidths[1], rowHeight, 'S');
        pdf.text(titleLines, currentX + 2, yPos + 5);
        currentX += colWidths[1];
        
        // Idea Description - wrap text
        pdf.rect(currentX, yPos, colWidths[2], rowHeight, 'S');
        pdf.text(descLines, currentX + 2, yPos + 5);
        
        yPos += rowHeight;
      });
      
      yPos += 15;
      
      // Evaluator Section Header
      if (yPos + 80 > pageHeight - margin) {
        pdf.addPage();
        pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
        yPos = margin;
      }
      
      // Add separator line
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 139); // Dark blue
      pdf.line(leftCol, yPos, pageWidth - margin, yPos);
      yPos += 8;
      
      // Evaluator Section Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 139); // Dark blue
      pdf.text('Evaluator Section', leftCol, yPos);
      pdf.setTextColor(0, 0, 0); // Back to black
      yPos += 10;
      
      // Evaluator Name field
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Evaluator Name:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      
      // Draw line for evaluator name
      const nameLineY = yPos + 2;
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(0, 0, 0); // Black
      pdf.line(leftCol + labelWidth, nameLineY, pageWidth - margin, nameLineY);
      yPos += 12;
      
      // Remarks Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Remarks:', leftCol, yPos);
      yPos += 5;
      
      // Draw remarks box
      const remarksHeight = 30;
      pdf.setLineWidth(0.3);
      pdf.rect(leftCol, yPos, pageWidth - 2 * margin, remarksHeight);
      yPos += remarksHeight + 15;
      
      // Evaluator Signature Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Evaluator Signature:', leftCol, yPos);
      yPos += 8;
      
      // Draw signature line with more space
      const sigLineY = yPos + 20;
      pdf.setLineWidth(0.3);
      pdf.line(leftCol, sigLineY, leftCol + 70, sigLineY);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      const footerText = 'Generated by Pythodar Idea Portal - ipstechcommunity@kgkite.ac.in';
      pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      pdf.save(`Pythodar_${formData.name}_${formData.rollNo}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // Reset the form after PDF generation (whether successful or not)
      resetForm();
      
      // Reset the state variables
      setIsGeneratingPdf(false);
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      rollNo: '',
      registrationNo: '',
      department: '',
    });
    setIdeas([
      { id: 1, title: '', description: '' }
    ]);
    setErrors({});
    
    // Reset the form element itself if the ref is available
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Modern Professional Header - Light Version */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="relative">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-800 to-blue-900"></div>
            
            <div className="p-6 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="bg-white p-3 rounded-lg shadow-md border border-blue-100">
                  <img 
                    src={logo} 
                    alt="KiTE Logo" 
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div className="pl-2">
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Pythodar Idea Submission Portal</h2>
                  <div className="flex items-center mt-1">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                    <p className="text-black-600 text-sm font-medium">co-<span className="text-red-600">K</span>reate your <span className="text-red-600">G</span>enius</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <a href="https://pyexpo.co/" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-lg shadow-md border border-blue-100 transition-all hover:shadow-lg hover:border-blue-200 hover:scale-105">
                  <img 
                    src={pyExpoLogo} 
                    alt="Python Expo Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </a>
                <a href="https://ips-community.netlify.app/" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-lg shadow-md border border-blue-100 transition-all hover:shadow-lg hover:border-blue-200 hover:scale-105">
                  <img 
                    src={techCommunityLogo} 
                    alt="Tech Community Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-900 to-blue-700 px-8 py-6">
            <h1 className="text-white text-3xl font-bold tracking-tight">Submit Your Innovative Ideas</h1>
            <p className="text-blue-50 text-sm mt-1">Complete the form below to generate your Idea PDF </p>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="px-8 py-8 space-y-8 bg-gradient-to-br from-blue-50 to-sky-50">
            {/* Info Box about Max Ideas */}
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Submit one innovative idea</span> that showcases your creativity and problem-solving skills.
                </p>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Roll Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.rollNo ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your roll number"
                    required
                  />
                  {errors.rollNo && (
                    <p className="mt-2 text-sm text-red-600">{errors.rollNo}</p>
                  )}
                </div>

                {/* Registration Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleInputChange}
                    onCopy={preventCopyPaste}
                    onPaste={preventCopyPaste}
                    className={`block w-full px-4 py-3 border ${errors.registrationNo ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    placeholder="Enter your registration number"
                    required
                  />
                  {errors.registrationNo && (
                    <p className="mt-2 text-sm text-red-600">{errors.registrationNo}</p>
                  )}
                </div>

                {/* Department */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 border ${errors.department ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white`}
                    required
                  >
                    <option value="">Select your department</option>
                    <option value="CSE">CSE</option>
                    <option value="AI&DS">AI&DS</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="RA">RA</option>
                    <option value="AIML">AI&ML</option>
                    <option value="IT">IT</option>
                    <option value="CYBER">Cyber Security</option>
                    <option value="CSBS">CSBS</option>
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ideas Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Your Idea
              </h3>

              {ideas.map((idea, index) => (
                <div key={idea.id} className="mb-6 pb-6">
                  <div className="space-y-4">
                    {/* Idea Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idea Title
                      </label>
                      <input
                        type="text"
                        value={idea.title}
                        onChange={(e) => handleIdeaChange(idea.id, 'title', e.target.value)}
                        onCopy={preventCopyPaste}
                        onPaste={preventCopyPaste}
                        className={`block w-full px-4 py-3 border ${errors[`ideaTitle${idea.id}`] ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                        placeholder="Enter a catchy title for your idea"
                        required
                      />
                      {errors[`ideaTitle${idea.id}`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`ideaTitle${idea.id}`]}</p>
                      )}
                    </div>

                    {/* Idea Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idea Description
                      </label>
                      <textarea
                        value={idea.description}
                        onChange={(e) => handleIdeaChange(idea.id, 'description', e.target.value)}
                        onCopy={preventCopyPaste}
                        onPaste={preventCopyPaste}
                        rows="4"
                        className={`block w-full px-4 py-3 border ${errors[`ideaDescription${idea.id}`] ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                        placeholder="Describe your idea in detail..."
                        required
                      ></textarea>
                      {errors[`ideaDescription${idea.id}`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`ideaDescription${idea.id}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting || isGeneratingPdf}
                className="px-5 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Form
                </div>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGeneratingPdf}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:transform-none"
              >
                {isGeneratingPdf ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Generate Idea PDF
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Simple Footer - Matching Header Style */}
      <footer className="mt-12">\
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Logo */}
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-blue-600 font-mono text-xl mr-2">&lt;/&gt;</span>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">IPS TECH</h3>
              </div>
            
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {/* GitHub */}
                <a href="https://github.com/Kite-IPS" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a href="https://lnkd.in/gZdPmjSB" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a href="https://www.instagram.com/ips_tech.community?igsh=MXNkdndoNzV6YWM3" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                {/* Gmail */}
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ipstechcommunity@kgkite.ac.in" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-600 text-sm mb-4 md:mb-0">
                  © {new Date().getFullYear()} IPS Tech Community. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm">
                  Made with <span className="text-blue-600">❤</span> by IPS Tech
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Template;