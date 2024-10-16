export const toggleSideBar = () => {
  // const burger = document.getElementById("site-burger");
  const burger = document.getElementById("site-menu");
  const sideBar = document.getElementById("mobile-sidebar").childNodes;
  const hasClass = burger.classList.contains("open");
  if (hasClass) {
    //sideBar.classList.add("hidden");
    sideBar[0].style.width = "0%";
    sideBar[1].style.display = "none";
    burger.classList.remove("open");
  } else {
    burger.classList.add("open");
    setTimeout(() => {
      //sideBar.classList.remove("hidden");
      sideBar[1].style.display = "block";
      sideBar[0].style.width = "70%";
    }, 400);
  }
};
