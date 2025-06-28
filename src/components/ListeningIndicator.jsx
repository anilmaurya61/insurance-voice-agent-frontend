const ListeningIndicator = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div id="listening" style={{
      fontWeight: 'bold',
      color: 'green',
      marginTop: '10px',
      animation: 'blink 1s infinite'
    }}>
      🎤 Listening...
    </div>
  );
};

export default ListeningIndicator;
