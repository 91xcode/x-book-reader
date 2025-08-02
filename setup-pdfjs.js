#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up PDF.js files...');

// Create public/vendor/pdfjs directory
const pdfJsDir = './public/vendor/pdfjs';
if (!fs.existsSync(pdfJsDir)) {
  fs.mkdirSync(pdfJsDir, { recursive: true });
  console.log('✅ Created public/vendor/pdfjs directory');
} else {
  console.log('📁 public/vendor/pdfjs directory already exists');
}

// Source paths
const sourceBase = './packages/foliate-js/node_modules/pdfjs-dist';
const legacyBuild = `${sourceBase}/legacy/build`;
const vendorBase = './packages/foliate-js/vendor/pdfjs';

// Files to copy
const filesToCopy = [
  {
    src: `${legacyBuild}/pdf.mjs`,
    dest: `${pdfJsDir}/pdf.mjs`,
    description: 'PDF.js main library'
  },
  {
    src: `${legacyBuild}/pdf.worker.min.mjs`,
    dest: `${pdfJsDir}/pdf.worker.min.mjs`,
    description: 'PDF.js worker'
  },
  {
    src: `${vendorBase}/annotation_layer_builder.css`,
    dest: `${pdfJsDir}/annotation_layer_builder.css`,
    description: 'Annotation layer CSS'
  },
  {
    src: `${vendorBase}/text_layer_builder.css`,
    dest: `${pdfJsDir}/text_layer_builder.css`,
    description: 'Text layer CSS'
  }
];

// Directories to copy
const dirsToCore = [
  {
    src: `${sourceBase}/cmaps`,
    dest: `${pdfJsDir}/cmaps`,
    description: 'Character maps'
  },
  {
    src: `${sourceBase}/standard_fonts`,
    dest: `${pdfJsDir}/standard_fonts`,
    description: 'Standard fonts'
  }
];

try {
  // Copy individual files
  filesToCopy.forEach(({ src, dest, description }) => {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${description}: ${path.basename(dest)}`);
    } else {
      console.warn(`⚠️  Source file not found: ${src}`);
    }
  });

  // Copy directories
  dirsToCore.forEach(({ src, dest, description }) => {
    if (fs.existsSync(src)) {
      execSync(`cp -r "${src}" "${dest}"`, { stdio: 'inherit' });
      console.log(`✅ Copied ${description}: ${path.basename(dest)}/`);
    } else {
      console.warn(`⚠️  Source directory not found: ${src}`);
    }
  });

  console.log('\n🎉 PDF.js setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure tsconfig.json has the @pdfjs/* path mapping');
  console.log('2. Run npm run dev:next to test the setup');
  
} catch (error) {
  console.error('❌ Error setting up PDF.js:', error.message);
  process.exit(1);
}