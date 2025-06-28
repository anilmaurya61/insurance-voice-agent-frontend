export const speak = (text, outputRef) => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    if (outputRef?.current) {
      outputRef.current.innerHTML += `<p><strong>Assistant:</strong> ${text}</p>`;
    }
    synth.speak(utter);
    utter.onend = () => resolve();
  });
};

export const listen = (promptIfSilent = "", retries = 2, outputRef, setIsListening) => {
  return new Promise((resolve, reject) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let attempts = 0;
    let resolved = false;

    const startListening = () => {
      setIsListening(true);
      recognition.start();
    };

    recognition.onresult = async (event) => {
      setIsListening(false);
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      outputRef.current.innerHTML += `<p><strong>You:</strong> ${transcript}</p>`;

      if (!transcript && attempts < retries) {
        attempts++;
        await speak(promptIfSilent, outputRef);
        startListening();
      } else {
        resolved = true;
        resolve(transcript);
      }
    };

    recognition.onerror = async (event) => {
      setIsListening(false);
      outputRef.current.innerHTML += `<p style="color:red;"><strong>Error:</strong> ${event.error}</p>`;
      if (attempts < retries) {
        attempts++;
        await speak(promptIfSilent, outputRef);
        startListening();
      } else {
        reject(event.error);
      }
    };

    recognition.onend = () => {
      if (!resolved) {
        setIsListening(false);
        if (attempts < retries) {
          attempts++;
          speak(promptIfSilent, outputRef);
          startListening();
        } else {
          reject("No response after multiple attempts.");
        }
      }
    };

    startListening();
  });
};
