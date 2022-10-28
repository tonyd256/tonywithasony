var hold;

document.addEventListener("DOMContentLoaded", function () {
  if (matchMedia('(pointer:fine)').matches) {
    let clips = document.querySelectorAll(".project-video");
    clips.forEach( function (c) {

      c.addEventListener('mouseover', function (e) {
        let video = e.target.querySelector("video");
        if (video) { video.play(); }
      });

      c.addEventListener('mouseout', function (e) {
        let video = e.target.querySelector("video");
        if (video) { video.pause(); }
      });
    });
  }

  if (Colcade) {
    initMasonry();
  } else {
    hold = setInterval(function () {
      if (Colcade) {
        initMasonry();
        clearInterval(hold);
        hold = null;
      }
    }, 1000);
  }
});

function initMasonry() {
  const grid = document.querySelector('.masonry');
  if (!grid) { return; }

  const masonry = new Colcade(grid, {
    columns: '.masonry-col',
    items: '.masonry-item'
  });

  imagesLoaded(grid, function () {
    masonry.layout();
  });
}
