#!/usr/bin/env node

/**
 * Modrinth Publishing Script
 * 
 * This script handles:
 * - Validating modpack files
 * - Uploading to Modrinth API
 * - Managing version metadata
 */

import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MODRINTH_API_URL = 'https://api.modrinth.com/v2';
const MODRINTH_PROJECT_ID = process.env.MODRINTH_PROJECT_ID || 'cG4k3W8Y';

class ModrinthPublisher {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Authorization': this.token,
      'Content-Type': 'application/json',
      'User-Agent': 'MC-Full-Park-Bot'
    };
  }

  /**
   * Get project information
   */
  async getProject() {
    try {
      const response = await axios.get(`${MODRINTH_API_URL}/project/${MODRINTH_PROJECT_ID}`, {
        headers: { 'Authorization': this.token }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error.message);
      throw error;
    }
  }

  /**
   * Validate modpack file
   */
  validatePack(filePath) {
    const stats = fs.statSync(filePath);
    
    // Check file size (should be < 500MB)
    if (stats.size > 500 * 1024 * 1024) {
      throw new Error('Modpack exceeds 500MB limit');
    }
    
    // Check file extension
    if (!filePath.endsWith('.zip')) {
      throw new Error('Modpack must be a .zip file');
    }
    
    return true;
  }

  /**
   * Create new version
   */
  async createVersion(versionData) {
    try {
      const response = await axios.post(
        `${MODRINTH_API_URL}/project/${MODRINTH_PROJECT_ID}/version`,
        versionData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating version:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload modpack file
   */
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${MODRINTH_API_URL}/file`,
        formData,
        { headers: { ...this.headers, 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync release information
   */
  async syncRelease(versionId) {
    try {
      await axios.post(
        `${MODRINTH_API_URL}/project/${MODRINTH_PROJECT_ID}/sync`,
        { version_id: versionId },
        { headers: this.headers }
      );
      console.log('✓ Release synced successfully');
    } catch (error) {
      console.error('Error syncing release:', error.message);
      throw error;
    }
  }

  /**
   * Full publish workflow
   */
  async publish(modpackPath, versionInfo) {
    console.log('🚀 Starting Modrinth publish...');
    
    // Validate file
    this.validatePack(modpackPath);
    console.log('✅ File validation passed');
    
    // Upload file
    const fileResult = await this.uploadFile(fs.createReadStream(modpackPath));
    console.log(`📦 File uploaded: ${fileResult.id}`);
    
    // Create version
    const versionData = {
      ...versionInfo,
      files: [{
        url: fileResult.url,
        primary: true,
        filename: modpackPath.split('/').pop()
      }]
    };
    
    const versionResult = await this.createVersion(versionData);
    console.log(`🏷️  Version created: v${versionResult.version_number}`);
    
    // Sync release
    await this.syncRelease(versionResult.id);
    
    console.log('✨ Publish completed!');
    return versionResult;
  }
}

// CLI entry point
async function main() {
  console.log('=== MC Full Park - Modrinth Publisher ===\n');
  
  const token = process.env.MODRINTH_TOKEN;
  if (!token) {
    console.error('❌ Missing MODRINTH_TOKEN environment variable');
    console.log('\nSet it in GitHub Secrets or use:');
    console.log('  export MODRINTH_TOKEN=your-token-here');
    process.exit(1);
  }
  
  // Default version info (can be overridden via CLI args)
  const versionInfo = {
    version_number: process.argv[2] || '1.0.0',
    changelog: process.argv[3] || 'Auto-generated release',
    loaders: ['fabric'],
    game_versions: ['26.1.2'],
    status: 'listed',
    requested_dependencies: []
  };
  
  const publisher = new ModrinthPublisher(token);
  const modpackPath = './artifacts/MC-Full-Pack-26.1.2-fabric.zip';
  
  try {
    await publisher.publish(modpackPath, versionInfo);
  } catch (error) {
    console.error('❌ Publish failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
