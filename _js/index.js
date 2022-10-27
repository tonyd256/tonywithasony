// var save;
var hold;

document.addEventListener("DOMContentLoaded", function () {
  if (matchMedia('(pointer:fine)').matches) {
    let clips = document.querySelectorAll(".project-video");
    clips.forEach( function (c) {

      c.addEventListener('mouseover', function (e) {
        let video = e.target.querySelector("video");
        video.play();
        // playing = true;
        // save = setInterval(transition, 2000, e.target);
      });

      c.addEventListener('mouseout', function (e) {
        let video = e.target.querySelector("video");
        video.pause();
        // clearInterval(save);
        // save = null;
        // killOpenFull();
      });
    });
  }

  // if (document.querySelector(".project-video")) {
  //   window.addEventListener('scroll', function () {
  //     clearInterval(save);
  //     save = null;
  //     killOpenFull();
  //   });
  // }

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
  console.log('init');
  new Colcade( '.masonry', {
    columns: '.masonry-col',
    items: '.masonry-item'
  });
}

// function transition(div) {
//   let parent = div.querySelector("video").parentElement;
//   div.classList.add('open-full');
//   let offset = div.offsetTop - window.scrollY;
//   parent.style.top = `-${offset}px`;
//   clearInterval(save);
//   save = null;
// }
//
// function killOpenFull() {
//   let div = document.querySelector('.open-full');
//
//   if (div) {
//     div.classList.remove('open-full');
//     div.querySelector("div").style.top = 0;
//   }
// }
