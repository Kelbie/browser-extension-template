# Shared localStorage Context for Chrome Extension Iframes

This guide explains how to give injected iframes the same localStorage context as the browser extension, bypassing the same-origin policy limitations.

## The Problem

By default, iframes have their localStorage isolated to their source domain. An iframe pointing to `https://localhost:8080` can only access localStorage for that domain, not the broader browser or extension context.

## Our Solution: Extension Storage Bridge

We've implemented a **Storage Bridge** system that:

1. **Uses Chrome extension storage** (`chrome.storage.local`) as the shared backend
2. **Provides a localStorage-like API** that works across all contexts
3. **Automatically syncs data** between main pages, iframes, and extension popup
4. **Maintains compatibility** with existing localStorage code

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Page     │    │   Iframe        │    │ Extension Popup │
│                 │    │ (localhost:8080)│    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Storage Bridge  │◄───┤ Storage Bridge  │◄───┤ Storage Bridge  │
│ _cashuStorage   │    │ _cashuStorage   │    │ _cashuStorage   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ chrome.storage.local    │
                    │ (Shared Backend)        │
                    └─────────────────────────┘
```

## Implementation Details

### 1. Storage Bridge Script (`storage-bridge.js`)

- **Injected into all contexts** (main page + iframes)
- **Creates `window._cashuStorage`** with localStorage-like API
- **Uses chrome.storage.local** as the persistent backend
- **Provides both async and sync methods**
- **Dispatches storage events** for real-time updates

### 2. Content Script Updates

- **Injects storage bridge** before other scripts
- **Sets up localStorage proxy** in iframes (optional)
- **Provides shared context** across all domains

### 3. Manifest Permissions

- **`"storage"` permission** for chrome.storage.local access
- **`storage-bridge.js`** added to web accessible resources

## API Usage

### Basic Operations

```javascript
// Set data (async)
await window._cashuStorage.setItem('user-token', 'abc123');

// Get data (async)
const token = await window._cashuStorage.getItem('user-token');

// Remove data
await window._cashuStorage.removeItem('user-token');

// Clear all data
await window._cashuStorage.clear();

// Get all items
const allData = await window._cashuStorage.getAllItems();
```

### Synchronous Methods (uses cached data)

```javascript
// Get data synchronously (from cache)
const token = window._cashuStorage.getItemSync('user-token');
```

### Storage Events

```javascript
// Listen for storage changes from other contexts
window.addEventListener('storage', (event) => {
    console.log('Storage changed:', {
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue
    });
});
```

### Initialization

```javascript
// Wait for storage bridge to be ready
window.addEventListener('cashuStorageReady', () => {
    console.log('Storage bridge ready!');
    // Now safe to use window._cashuStorage
});
```

## Testing

### 1. Load Extension
- Load the extension in Chrome Developer mode
- Ensure it has storage permissions

### 2. Test Pages
- **`storage-test.html`** - Interactive test interface
- **`blank-test.html`** - Simple iframe injection test

### 3. Expected Behavior
1. Extension injects iframe pointing to localhost:8080
2. Both main page and iframe have access to `window._cashuStorage`
3. Data set in main page is accessible in iframe
4. Storage events propagate between contexts
5. Data persists across browser sessions

## Console Messages to Look For

```
💾 Initializing Cashu Storage Bridge
💾 Storage bridge initialized with X items
💾 Storage bridge ready
💾 Storage bridge ready in iframe!
💾 Stored iframe data in shared storage
💾 Intercepted localStorage.setItem: key = value
```

## Advanced Features

### localStorage Proxy (Optional)

The system can optionally override the iframe's `localStorage` to use shared storage:

```javascript
// In iframe, localStorage calls are intercepted
localStorage.setItem('key', 'value'); // Actually uses shared storage
const value = localStorage.getItem('key'); // Gets from shared storage
```

### Sync with Regular localStorage

```javascript
// Sync extension storage to regular localStorage
await window._cashuStorage.syncToLocalStorage();

// Sync regular localStorage to extension storage
await window._cashuStorage.syncFromLocalStorage();
```

## Security Considerations

1. **Extension Permissions**: Requires `"storage"` permission
2. **Cross-Origin Access**: Storage bridge bypasses same-origin policy securely
3. **Data Isolation**: Data is isolated to the extension context
4. **HTTPS Requirements**: Works with both HTTP and HTTPS iframes

## Troubleshooting

### Common Issues

1. **Storage not available**
   - Check extension is loaded and has storage permission
   - Verify `storage-bridge.js` is injected

2. **Data not syncing**
   - Check console for storage bridge initialization messages
   - Verify iframe is receiving the script injection

3. **Permission errors**
   - Ensure manifest.json includes `"storage"` permission
   - Check host permissions for iframe domains

### Debug Commands

```javascript
// Check if storage bridge is loaded
console.log('Storage available:', !!window._cashuStorage);

// Check cached data
console.log('Cached items:', window._cashuStorageBridge._cache);

// Get all stored data
window._cashuStorage.getAllItems().then(console.log);
```

## Benefits

✅ **True shared context** - Data accessible across all extension contexts
✅ **Persistent storage** - Data survives browser restarts
✅ **Real-time sync** - Changes propagate immediately
✅ **localStorage compatible** - Drop-in replacement for most use cases
✅ **Cross-origin support** - Works with any iframe domain
✅ **Event-driven** - Storage change events for reactive updates

This implementation gives your injected iframes the same localStorage context as your extension, enabling true data sharing across all contexts while maintaining security and performance.

