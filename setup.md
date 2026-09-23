# Setup Guide

This document explains how to set up and run the Docker Dashboard React project using the provided `setup.sh` commands.

## 1. Clone the Repository

Clone the project repository:

```bash
git clone https://github.com/Bhandekunal16/docker-dashboard.git
```

Then enter the project directory:

```bash
cd docker-dashboard
```

## 2. Install Dependencies

Install the project dependencies:

```bash
npm i --f
```

> **Note:** The command above is preserved exactly from the provided `setup.sh` file. Verify the intended npm option if this command fails in your environment.

## 3. Run the Application

The project provides several `runner.sh` commands for different workflows.

### Start the Desktop Application

```bash
./runner.sh desktop
```

This requests one-time sandbox permission through `pkexec`.

### Start the Web/Backend Application

```bash
./runner.sh web
```

This starts the backend only.

### Build Desktop Installers

```bash
./runner.sh build
```

This builds the desktop installers.

### Run Tests

```bash
./runner.sh test
```

This runs the backend and desktop tests.

## Quick Reference

| Command | Purpose |
|---|---|
| `./runner.sh desktop` | Start the desktop application |
| `./runner.sh web` | Start the backend only |
| `./runner.sh build` | Build desktop installers |
| `./runner.sh test` | Run backend and desktop tests |

## Original Setup Commands

The commands above are based directly on the provided `setup.sh` file. 
