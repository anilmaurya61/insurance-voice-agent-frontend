const ListeningIndicator = () => (
  <div id="listening" style={{
    display: 'none',
    fontWeight: 'bold',
    color: 'green',
    marginTop: '10px',
    animation: 'blink 1s infinite'
  }}>
    🎤 Listening...
  </div>
);

export default ListeningIndicator;
