/* Add Notes */

function openNav() {
  document.getElementById("mySidenav").style.width = "100%";
  document.getElementById("inner-style").classList.add("filter_width");
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("inner-style").classList.remove("filter_width");
}

/* Add Notes */

/* Publish Notes */
	
function openpublishNav()
{
  document.getElementById("mySidenavtwo").style.width = "100%";
  document.getElementById("inner-styletwo").classList.add("filter_width_publish");
}

function closepublishNav() 
{
  document.getElementById("mySidenavtwo").style.width = "0";
  document.getElementById("inner-styletwo").classList.remove("filter_width_publish");
}

/* Publish Notes */

/* Send content */
	
function opencontentNav()
{
  document.getElementById("mySidenavthree").style.width = "100%";
  document.getElementById("inner-stylethree").classList.add("filter_width_content");
}

function closecontentNav() 
{
  document.getElementById("mySidenavthree").style.width = "0";
  document.getElementById("inner-stylethree").classList.remove("filter_width_content");
}

/* Send Conetnt */

/* Horizontal Click and Drag Scrolling */

const slider = document.querySelector('.items');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  slider.classList.add('active');
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('active');
});
slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.classList.remove('active');
});
slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 3; //scroll-fast
  slider.scrollLeft = scrollLeft - walk;
  console.log(walk);
});

/* Horizontal Click and Drag Scrolling */

$(document).ready(function () {
  $(".navbar-toggle").on("click", function () {
      $(this).toggleClass("active");
      $(".intersight_home").toggleClass("show");
  });
});








