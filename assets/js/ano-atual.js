// Insere o ano atual em um elemento com id="ano-atual"
document.addEventListener("DOMContentLoaded", function () {
  const ano = new Date().getFullYear();
  const spanAno = document.getElementById("ano-atual");
  if (spanAno) {
    spanAno.textContent = ano;
  }
});
