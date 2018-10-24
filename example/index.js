window.login = function () {
  let userData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  };
  let connection = new YayFonNewSdk(userData);
  console.log(connection);
  connection.getAuthData(userData)
    .then(response => {
      console.log(response);
    })
}
