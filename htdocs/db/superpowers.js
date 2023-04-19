function removeFromGallery(event) {
  let closest = event.target.closest(".database-item");
  let shorturl = closest.id;

  fetch("db/delete.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ shorturl: shorturl }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      if (result !== undefined && result.success !== undefined) {
        if (result.success) {
          closest.remove();
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
