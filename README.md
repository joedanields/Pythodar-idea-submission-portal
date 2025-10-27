# 🐍 Pythodar Idea Portal

A modern, professional web application for submitting innovative ideas for the Pythodar event - a Python-focused innovation portal by IPS Tech Community at KiTE.

![Pythodar Banner](https://img.shields.io/badge/Pythodar-Idea%20Portal-blue?style=for-the-badge&logo=python)

## 🎯 **About Pythodar**

**Pythodar** is an innovative idea submission portal where students can submit their creative Python-based project ideas. The portal generates professional PDF documents for idea evaluation and record-keeping.

### 🏢 **Organized By:**
- **IPS Tech Community** - KG Kalaignar Institute of Technology (KiTE)
- **Partner Event:** Python Expo (PyExpo)

## ✨ **Features**

### 🎨 **Modern UI/UX**
- Clean, professional interface with gradient designs
- Fully responsive layout (mobile-friendly)
- Real-time form validation with error handling
- Copy-paste prevention for security

### 📋 **Form Management**
- Student information collection (Name, Roll No, Registration No, Department)
- Single idea submission with title and description
- Department selection dropdown with all major branches
- Form reset functionality

### 📄 **PDF Generation**
- Professional PDF layout with institutional branding
- Multiple logo integration (College, PyExpo, IPS Tech)
- Structured format with evaluator section
- Auto-naming: `Pythodar_[Name]_[RollNo].pdf`

### 🔒 **Security Features**
- Copy-paste prevention on all input fields
- Form validation before submission
- Error handling for PDF generation

## 🛠️ **Technology Stack**

### **Frontend**
- **React 19.1.1** - Latest React with modern hooks
- **Vite 7.1.2** - Fast build tool and dev server
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **React Router DOM 7.8.2** - Client-side routing

### **PDF Generation**
- **jsPDF 3.0.2** - PDF generation library
- **html2canvas 1.4.1** - HTML to canvas conversion

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Vite plugins** - React and Tailwind integration

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16+ recommended)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/joedanields/Record_Generator_Custom.git
   cd Record_Generator_Custom
   ```

2. **Navigate to Client directory**
   ```bash
   cd Client
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

## 📁 **Project Structure**

```
Record_Generator_Custom/
├── Client/                     # React application
│   ├── src/
│   │   ├── assets/            # Images and logos
│   │   │   ├── col-kitelogo.webp
│   │   │   ├── PyExpoLogo.svg
│   │   │   ├── ips.webp
│   │   │   └── splitup.png
│   │   ├── pages/
│   │   │   └── Template.jsx   # Main form component
│   │   ├── App.jsx           # Root component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
└── README.md                # Project documentation
```

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Blue/Indigo gradients (`from-blue-500 to-indigo-800`)
- **Secondary**: Sky blue accents (`from-sky-900 to-blue-700`)
- **Background**: Light gray gradients (`from-slate-100 to-slate-200`)
- **Text**: Dark gray to black hierarchy

### **Typography**
- **Font Family**: DM Sans (Google Fonts)
- **Headings**: Bold weights with proper hierarchy
- **Body**: Regular weight with good readability

### **Components**
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Subtle shadows (`shadow-lg`, `shadow-xl`)
- Smooth transitions and hover effects
- Consistent spacing using Tailwind's spacing scale

## 📋 **Usage Guide**

### **For Students:**
1. Fill in personal details (Name, Roll No, Registration No, Department)
2. Enter your innovative idea title and description
3. Click "Generate Idea PDF" to create and download your submission
4. Submit the generated PDF as per event instructions

### **For Administrators:**
- The generated PDF includes an evaluator section for assessment
- Each PDF is uniquely named with student details
- Professional layout suitable for official documentation

## ⚙️ **Configuration**

### **Maximum Ideas Limit**
```javascript
// In Template.jsx
const MAX_IDEAS = 1; // Currently set to 1 idea per submission
```

### **Available Departments**
- CSE (Computer Science Engineering)
- AI&DS (Artificial Intelligence & Data Science)
- ECE (Electronics & Communication Engineering)
- MECH (Mechanical Engineering)
- RA (Robotics & Automation)
- AI&ML (Artificial Intelligence & Machine Learning)
- IT (Information Technology)
- Cyber Security
- CSBS (Computer Science & Business Systems)

## 🌐 **Deployment**

### **Netlify Deployment (Recommended)**
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure custom domain if needed

### **Suggested URLs:**
- `pythodar-idea-portal.netlify.app`
- `pythodar-submissions.netlify.app`
- `kite-pythodar.netlify.app`

## 🤝 **Contributing**

We welcome contributions to improve the Pythodar Idea Portal!

### **How to Contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines:**
- Follow the existing code style
- Test your changes thoroughly
- Update documentation as needed
- Ensure mobile responsiveness

## 📞 **Contact & Support**

### **IPS Tech Community**
- **Website**: [ips-community.netlify.app](https://ips-community.netlify.app/)
- **Email**: ipstechcommunity@kgkite.ac.in
- **GitHub**: [Kite-IPS](https://github.com/Kite-IPS)
- **LinkedIn**: [IPS Tech Community](https://lnkd.in/gZdPmjSB)
- **Instagram**: [@ips_tech.community](https://www.instagram.com/ips_tech.community)

### **Python Expo**
- **Website**: [pyexpo.co](https://pyexpo.co/)

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🏆 **Acknowledgments**

- **KG Kalaignar Institute of Technology (KiTE)** - For institutional support
- **IPS Tech Community** - For organizing and maintaining the project
- **Python Expo Team** - For partnership and collaboration
- **Contributors** - For their valuable contributions

---

<div align="center">

**Made with ❤️ by IPS Tech Community**

*co-Kreate your Genius*

![KiTE Logo](https://img.shields.io/badge/KiTE-Institute-blue?style=flat-square)
![IPS Tech](https://img.shields.io/badge/IPS-Tech%20Community-green?style=flat-square)
![PyExpo](https://img.shields.io/badge/Python-Expo-yellow?style=flat-square)

</div>