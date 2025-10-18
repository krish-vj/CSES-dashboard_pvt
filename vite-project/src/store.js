document.getElementById('setFile').addEventListener('click', async () => {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: 'C++ Files', accept: { 'text/plain': ['.cpp'] } }]
    });
    await chrome.storage.local.set({ defaultFileHandle: fileHandle });
    alert('Default file set! Will auto-select on CSES.');
  } catch (err) {
    if (err.name !== 'AbortError') console.error('Error setting file:', err);
  }
});