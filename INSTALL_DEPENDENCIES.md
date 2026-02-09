# Installing Dependencies

## Issue with npm

If you're experiencing issues with `npm install`, try one of these alternatives:

### Option 1: Use pnpm (Recommended - already configured in project)

```bash
# Install pnpm globally if you don't have it
npm install -g pnpm

# Then install dependencies
pnpm install
```

### Option 2: Use yarn

```bash
# Install yarn globally if you don't have it
npm install -g yarn

# Then install dependencies
yarn install
```

### Option 3: Fix npm and retry

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Option 4: Manual Resend Installation

If only resend is missing:

```bash
pnpm add resend
# or
yarn add resend
# or
npm install resend --legacy-peer-deps
```

## Verify Installation

After installing, verify resend is in your `node_modules`:

```bash
ls node_modules | grep resend
```

You should see `resend` in the output.

## Start Development Server

Once dependencies are installed:

```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```

The server should start without errors.
