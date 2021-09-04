document.getElementById("search").addEventListener("input", () => {
  document.querySelectorAll(".picture_element").forEach( element => {
    element.style.display = "none";
    if (element.getAttribute("id").includes(document.getElementById("search").value)) {
      element.style.display = "block";
    }
  });
});
