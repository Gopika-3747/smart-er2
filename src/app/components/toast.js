const NotificationToast = ({ message, type, onClose }) => {
  return (
    <div className={`fixed bottom-5 right-5 left-5 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300
      ${type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

export default NotificationToast;
