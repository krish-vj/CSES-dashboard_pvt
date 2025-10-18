import React, { useState, useEffect } from 'react';

// Define the structure of your settings
interface Settings {
  tagsEnabled: boolean;
  timeEnabled: boolean;
  hintsEnabled: boolean;
  globalStatsEnabled: boolean;
  categoryStatsEnabled: boolean;
  sortEnabled: boolean;
  autoLoginEnabled: boolean;
  autoModeEnabled: boolean;
  submitByTextEnabled: boolean;
  username: string;
  password: string;
  mode: 'd' | 'l';
  
  
}

// Main App Component
function App() {
  // State for all settings, initialized with defaults
  const [settings, setSettings] = useState<Settings>({
    tagsEnabled: true,
    timeEnabled: true,
    hintsEnabled: true,
    globalStatsEnabled: true,
    categoryStatsEnabled: true,
    sortEnabled: true,
    autoLoginEnabled: false,
    autoModeEnabled: false,
    submitByTextEnabled: true,
    username: '',
    password: '',
    mode: 'd',
    
  });

  // State to control the visibility of the login form
  const [showLoginForm, setShowLoginForm] = useState(false);
  // State for displaying feedback messages to the user
  const [message, setMessage] = useState('');
  
  // State for the controlled inputs in the login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'d' | 'l'>('d');


  // useEffect to load settings from chrome.storage.local when the component mounts
  useEffect(() => {
    // Check if chrome.storage is available
    if (chrome.storage && chrome.storage.local) {
      const settingKeys = [
        'tagsEnabled','timeEnabled', 'hintsEnabled', 'globalStatsEnabled',
        'categoryStatsEnabled', 'sortEnabled', 'autoLoginEnabled',
        'autoModeEnabled', 'submitByTextEnabled', 'username', 'pwd', 'mode'
      ];
      chrome.storage.local.get(settingKeys).then((items) => {
        setSettings({
          tagsEnabled: items.tagsEnabled ?? true,
          timeEnabled: items.timeEnabled?? true,
          hintsEnabled: items.hintsEnabled ?? true,
          globalStatsEnabled: items.globalStatsEnabled ?? true,
          categoryStatsEnabled: items.categoryStatsEnabled ?? true,
          sortEnabled: items.sortEnabled ?? true,
          autoLoginEnabled: items.autoLoginEnabled ?? false,
          autoModeEnabled: items.autoModeEnabled ?? false,
          submitByTextEnabled: items.submitByTextEnabled ?? true,
          username: items.username || '',
          password: items.pwd || '',
          mode: items.mode || 'd',
          
        });
      });
    }
  }, []);

  // useEffect to populate login form fields when it becomes visible
  useEffect(() => {
      if (showLoginForm) {
          setLoginUsername(settings.username);
          setLoginPassword(settings.password);
          setLoginMode(settings.mode);
      }
  }, [showLoginForm, settings]);


  // Handles toggling boolean settings
  const handleToggle = (key: keyof Settings) => {
    const newValue = !settings[key];
    // Update React state
    setSettings(prevSettings => ({ ...prevSettings, [key]: newValue }));
    // Persist change to chrome storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: newValue });
    }

    // Automatically show login form if an automation feature is enabled without credentials
    if ((key === 'autoLoginEnabled' || key === 'autoModeEnabled') && newValue && !settings.username) {
      setShowLoginForm(true);
    }
  };

  // Handles saving credentials from the login form
  const handleSaveCredentials = () => {
    if (!loginUsername || !loginPassword) {
      setMessage('Please fill all fields!');
      return;
    }

    const credentials = {
      'username': loginUsername,
      'pwd': loginPassword,
      'mode': loginMode
    };

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(credentials).then(() => {
        setSettings(prevSettings => ({
          ...prevSettings,
          username: loginUsername,
          password: loginPassword,
          mode: loginMode
        }));
        setShowLoginForm(false);
        setMessage('Credentials saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }).catch(error => {
        setMessage('Error saving credentials: ' + error.toString());
      });
    }
  };

  return (
    // Main container with adjusted padding for a better extension popup look
    <div style={{
      background: '#1a1a1a',
      color: '#e0e0e0',
      padding: '20px', // Uniform padding
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minWidth: '350px' // Set a min-width for pop-up consistency
    }}>
      <div style={{
        maxWidth: '400px', // Constrained width for the popup
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
          CSES Extension
        </h1>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px' }}>
          Configure your CSES problem set experience
        </p>

        {message && (
          <div style={{
            padding: '12px 16px',
            background: message.startsWith('Error') ? '#4a2a2a' : '#2a4a2a',
            border: `1px solid ${message.startsWith('Error') ? '#7c4a4a' : '#4a7c4a'}`,
            borderRadius: '6px',
            marginBottom: '24px',
            color: message.startsWith('Error') ? '#df8f8f' : '#8fdf8f',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
        
        {/* Automation Section */}
        <div style={{ background: '#242424', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px', color: '#ffffff' }}>
            Automation
          </h2>
          <ToggleItem label="Auto Login" description="Automatically log in with saved credentials" checked={settings.autoLoginEnabled} onChange={() => handleToggle('autoLoginEnabled')} />
          <ToggleItem label="Auto Mode" description="Automatically switch to preferred theme mode" checked={settings.autoModeEnabled} onChange={() => handleToggle('autoModeEnabled')} isLast />

          {(settings.autoLoginEnabled || settings.autoModeEnabled) && (
            <div style={{ marginTop: '24px' }}>
              {!showLoginForm ? (
                <button
                  onClick={() => setShowLoginForm(true)}
                  style={{ padding: '8px 16px', background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: '6px', color: '#e0e0e0', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  {settings.username ? 'Update Credentials' : 'Setup Credentials'}
                </button>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '20px', marginTop: '12px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#b0b0b0' }}>Username</label>
                    <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#b0b0b0' }}>Password</label>
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#b0b0b0' }}>Preferred Mode</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="radio" value="d" checked={loginMode === 'd'} onChange={() => setLoginMode('d')} style={{ marginRight: '6px' }} />
                        <span style={{ fontSize: '14px' }}>Dark</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="radio" value="l" checked={loginMode === 'l'} onChange={() => setLoginMode('l')} style={{ marginRight: '6px' }} />
                        <span style={{ fontSize: '14px' }}>Light</span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleSaveCredentials} style={{ padding: '8px 16px', background: '#5CAFFF', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}>Save</button>
                    <button onClick={() => setShowLoginForm(false)} style={{ padding: '8px 16px', background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: '6px', color: '#e0e0e0', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Features Section */}
        <div style={{ background: '#242424', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px', color: '#ffffff' }}>
            Features
          </h2>
          <ToggleItem label="Time Complexity" description="Show expected time complexity for tasks" checked={settings.timeEnabled} onChange={() => handleToggle('timeEnabled')} />
          <ToggleItem label="Tags Display" description="Show problem tags" checked={settings.tagsEnabled} onChange={() => handleToggle('tagsEnabled')} />
          <ToggleItem label="Hints Display" description="Show problem hints" checked={settings.hintsEnabled} onChange={() => handleToggle('hintsEnabled')} />
          <ToggleItem label="Global MyStats" description="Display global statistics in navigation bar" checked={settings.globalStatsEnabled} onChange={() => handleToggle('globalStatsEnabled')} />
          <ToggleItem label="Category Stats" description="Show statistics for each problem category" checked={settings.categoryStatsEnabled} onChange={() => handleToggle('categoryStatsEnabled')} />
          <ToggleItem label="Sort Button" description="Enable sorting problems by solvers/acceptance rate" checked={settings.sortEnabled} onChange={() => handleToggle('sortEnabled')} />
          <ToggleItem label="Submit by Text" description="Enable text-based code submission" checked={settings.submitByTextEnabled} onChange={() => handleToggle('submitByTextEnabled')} isLast />
        </div>

        {/* Footer/Contact Section */}
        <div style={{ textAlign: 'center', padding: '20px 0 0' }}>
          <a href="mailto:joshikrish533@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#5CAFFF', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '18px' }}>✉</span>
            Contact Developer
          </a>
        </div>
      </div>
    </div>
  );
}

// Reusable ToggleItem Component
interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  isLast?: boolean;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, description, checked, onChange, isLast }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: isLast ? '0' : '16px',
      marginBottom: isLast ? '0' : '16px',
      borderBottom: isLast ? 'none' : '1px solid #3a3a3a'
    }}>
      <div style={{ flex: 1, paddingRight: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px', color: '#ffffff' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#888' }}>{description}</div>
      </div>
      <div onClick={onChange} style={{ width: '48px', height: '26px', background: checked ? '#5CAFFF' : '#3a3a3a', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0 }}>
        <div style={{ width: '22px', height: '22px', background: '#ffffff', borderRadius: '50%', position: 'absolute', top: '2px', left: checked ? '24px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
};

export default App;
