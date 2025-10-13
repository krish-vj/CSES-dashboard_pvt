import './App.css'

function App() {
  const message2="Success!"
  
  return (
    <>

    <h1 style={{fontSize: '30px'}}>CSES EXTENSION</h1>
    <hr />
      <div>Adds a MYSTATS button in navigation bar for problemset</div>    
      <hr />
      <div>Set up Automatic login and mode switching</div>
      <pre>   (stored in local storage only)</pre>
      <button onClick={()=>{ document.getElementById('form')!.style.display='block'}}>Setup</button>
      <h3><div id='msg2'></div></h3>
      <div id='form' style={{display:'none'}}>
        <fieldset>
      <label htmlFor="username" style={{display: 'inline-block',width: '60px'}}>Username: </label>
      <input type="text" id='username' name='username'/> <br />
      <label htmlFor="pwd" style={{display: 'inline-block', width: '60px'}}>Password:</label>
      <input type="text" id='pwd' name='pwd'/> <br />
      <hr />
      <label htmlFor="mode">Mode:  </label>
      <input type="radio" id="dark" name="mode" value="d"/>
      <label htmlFor="dark">Dark </label>
      <input type="radio" id="light" name="mode" value="l"/>
      <label htmlFor="css">Light</label><br/>
      <button style={{margin: '5px'}} onClick={()=>{

        const usrn= document.getElementById('username');
        const pwd= document.getElementById('pwd');
        const mode= document.querySelector('input[name="mode"]:checked');
        console.log((usrn as HTMLInputElement)!.value);

        chrome.storage.local.set({
                'username': (usrn as HTMLInputElement)!.value,
                'pwd': (pwd as HTMLInputElement)!.value,
                'mode': (mode as HTMLInputElement)!.value
                
            }).catch(error => {
                document.getElementById('msg2')!.innerText= error.toString();
                console.error("Error saving to storage:", error);
            });
            document.getElementById('form')!.style.display='none';
            document.getElementById('msg2')!.innerText= message2;
      }}
      >Submit</button> </fieldset></div>
    </>
  )
}

export default App
