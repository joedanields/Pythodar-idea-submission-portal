# Record Generator

The Record Generator is a web application designed to streamline the process of creating and downloading PDF lab records. It provides a user-friendly interface for students to input experiment details, upload images, and generate a professional-looking PDF document.

## Features

- **Dynamic PDF Generation:** Automatically creates a well-formatted PDF document from the provided form data.
- **Image Uploads:** Supports uploading multiple images for both the program and output sections of the lab record.
- **Form Validation:** Ensures that all required fields are filled out before allowing the user to generate the PDF.
- **Customizable Academic Year:** The mark split-up table in the generated PDF can be customized based on the student's academic year.
- **Copy-Paste Prevention:** Disables copy-pasting in text fields to encourage original content.
- **Reset Form:** Allows users to easily clear the form and start over.
- **Responsive Design:** The application is fully responsive and works on various screen sizes.

## Technologies Used

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool that provides a quicker and leaner development experience.
- **Tailwind CSS:** A utility-first CSS framework for creating custom designs.
- **jsPDF:** A library to generate PDFs in JavaScript.
- **html2canvas:** A library to capture screenshots of webpages or parts of it.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm:** npm is included with Node.js.

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/your-username/your-repository.git
   ```
2. Navigate to the `Client` directory:
   ```sh
   cd Client
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```

### Running the Application

To run the application in development mode, use the following command:

```sh
npm run dev
```

This will start the development server and you can view the application in your browser at `http://localhost:5173/`.
