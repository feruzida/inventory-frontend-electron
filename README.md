# Inventory Management — Frontend (Electron.js)

Linux-based desktop client for the All Store Stock Management system.

## Overview
This frontend is implemented as a lightweight Electron.js desktop application.
It communicates with a Java TCP socket server using JSON-formatted messages.

The goal of this frontend is to provide a simple and reliable client interface
for testing and demonstrating client–server communication.

## Technology Stack
- Electron.js
- Node.js
- HTML / CSS / JavaScript
- TCP sockets
- JSON

## Features
- Linux desktop application
- TCP socket connection to Java server (port 8080)
- JSON request/response communication
- Login request support
- Data request support
- Real-time server response display

## How to Run

### Requirements
- Linux OS
- Node.js (v18+ recommended)

### Steps
```bash
npm install
npx electron .
