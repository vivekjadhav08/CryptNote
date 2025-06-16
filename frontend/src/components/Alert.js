import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

function Alert({ alert }) {
  useEffect(() => {
    if (alert) {
      Swal.fire({
        icon: alert.type === 'danger' ? 'error' : alert.type,
        title: alert.type === 'danger' ? 'Error' : capitalize(alert.type),
        text: alert.msg,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        width: '320px',
        padding: '1em 1.5em',
        background: '#333',
        color: '#fff',
        customClass: {
          popup: 'shadow-lg rounded',
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      });
    }
  }, [alert]);

  const capitalize = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  return null;
}

export default Alert;
