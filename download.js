document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('download-launcher');

  if (!downloadBtn) {
    console.error('Ошибка: Кнопка #download-launcher не найдена');
    return;
  }

  downloadBtn.addEventListener('click', () => {
    // Путь к файлу лаунчера
    const fileUrl = '/files/launcher.exe'; // Укажи правильный путь к файлу
    const fileName = 'PastaXYZ_Launcher.exe'; // Имя файла для скачивания

    // Создаём временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Инициирована загрузка:', fileUrl);
  });
});