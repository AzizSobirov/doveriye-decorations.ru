//** popup */
class Popup {
  constructor(name, data) {
    this.popup = document.querySelector(name);
    this.popupContent = this.popup.querySelector(".popup__content");
    this.title = this.popup.querySelector("#form-content .text-h3");
    this.btnTitle = this.popup.querySelector("#form-content .btn");
    this.body = document.querySelector("body");

    this.title.innerHTML = data || this.title.innerHTML;
    this.btnTitle.innerHTML = data || this.btnTitle.innerHTML;
  }
  open() {
    this.popup.style.display = "flex";
    setTimeout(() => {
      this.popupContent.style.opacity = "1";
      this.popupContent.style.transform = "scale(1)";
      this.body.classList.add("overflow-hidden");
    }, 50);
  }
  close() {
    this.popupContent.style.opacity = "0";
    this.popupContent.style.transform = "scale(0.85)";
    this.body.classList.remove("overflow-hidden");

    setTimeout(() => {
      this.popup.style.display = "none";
    }, 500);
  }
}

const openPopup = (name, data) => {
  new Popup(`.popup--${name}`, data).open();
};

const closePopup = (name, data) => {
  new Popup(`.popup--${name}`, data).close();
};
// ** end popup

//** sticky header **/
const header = document.querySelector(".header");
function toggleNav() {
  document.querySelector(".page-header__nav").classList.toggle("active");
  header.classList.toggle("header-active");
}

class Filter {
  constructor() {
    this.minPriceInp = document.querySelector("#min-price");
    this.maxPriceInp = document.querySelector("#max-price");
    this.minSlider = document.querySelector("#slider-min");
    this.maxSlider = document.querySelector("#slider-max");
    this.collectionEl = document.querySelectorAll("#filter-collection li");
    this.stateEl = document.querySelectorAll("#filter-state li");
    this.typeEl = document.querySelectorAll("#filter-type li");
    this.brandEl = document.querySelectorAll("#filter-brand a");
    this.priceEl = document.querySelector("#filter-price");
    this.productsEl = document.querySelector("#catalog-products");
    this.products = null;
    this.collection = null;
    this.state = null;
    this.type = null;
    this.price_from = 0;
    this.price_to = 0;
    this.minPrice = 0;
    this.maxPrice = 10000000;
  }
  init() {
    let url = new URL(window.location);

    // collection
    let collection = url.searchParams.get("collection");
    if (collection) {
      this.collectionEl.forEach((item) => {
        if (item.innerHTML == collection) {
          this.collection = collection;
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }

    // state
    let state = url.searchParams.get("state");
    if (state) {
      this.stateEl.forEach((item) => {
        if (item.innerHTML == state) {
          this.state = state;
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }

    // type
    let type = url.searchParams.get("type");
    if (type) {
      this.typeEl.forEach((item) => {
        if (item.innerHTML == type) {
          this.type = type;
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }

    // brand
    this.brandEl.forEach((item) => {
      let href = new URL(item.href);
      if (url.pathname == href.pathname) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // price from
    let priceFrom = url.searchParams.get("from");
    if (priceFrom) {
      this.price_from = priceFrom;
    } else {
      this.price_from = this.minPrice;
    }

    let priceTo = url.searchParams.get("to");
    if (priceTo) {
      this.price_to = priceTo;
    } else {
      this.price_to = this.maxPrice;
    }
    this.minPriceInp.value = this.price_from;
    this.maxPriceInp.value = this.price_to;
    this.minSlider.value = (this.price_from * 100) / this.maxPrice;
    this.maxSlider.value = (this.price_to * 100) / this.maxPrice;

    // products
    let products = this.productsEl.querySelectorAll(".catalog__product");
    this.products = products;
    this.productsEl.innerHTML = "";

    this.watch();
    this.render();
  }
  watch() {
    this.collectionEl.forEach((item) => {
      item.addEventListener("click", () => {
        this.collection = item.innerHTML;
        this.collectionEl.forEach((item) => {
          item.classList.remove("active");
        });
        item.classList.add("active");
        this.save();
      });
    });
    this.stateEl.forEach((item) => {
      item.addEventListener("click", () => {
        this.state = item.innerHTML;
        this.stateEl.forEach((item) => {
          item.classList.remove("active");
        });
        item.classList.add("active");
        this.save();
      });
    });
    this.typeEl.forEach((item) => {
      item.addEventListener("click", () => {
        this.type = item.innerHTML;
        this.typeEl.forEach((item) => {
          item.classList.remove("active");
        });
        item.classList.add("active");
        this.save();
      });
    });
    this.brandEl.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.save(e.target.href);
      });
    });

    // price inputs
    this.minPriceInp.addEventListener("input", () => {
      this.price_from = this.minPriceInp.value;
      this.minSlider.value = (this.price_from * 100) / this.maxPrice;
      this.save();
    });
    this.maxPriceInp.addEventListener("input", () => {
      this.price_to = parseInt(this.maxPriceInp.value);
      this.maxSlider.value = (this.price_to * 100) / this.maxPrice;
      this.save();
    });

    const updatePrice = () => {
      let gap = this.maxPrice - this.minPrice;
      let fromValue = (gap * this.minSlider.value) / 100 + this.minPrice;
      let toValue = (gap * this.maxSlider.value) / 100 + this.minPrice;

      this.price_from = Math.floor(fromValue);
      this.price_to = Math.floor(toValue);
      this.minPriceInp.value = this.price_from;
      this.maxPriceInp.value = this.price_to;
      this.save();
    };

    this.maxSlider.addEventListener("input", () => {
      let minValue = parseInt(this.minSlider.value);
      let maxValue = parseInt(this.maxSlider.value);
      if (maxValue < minValue + 5) {
        this.minSlider.value = maxValue - 5;
        if (minValue === parseInt(this.minSlider.min)) {
          this.maxSlider.value = 5;
        }
      }
      updatePrice();
    });
    this.minSlider.addEventListener("input", () => {
      let minValue = parseInt(this.minSlider.value);
      let maxValue = parseInt(this.maxSlider.value);
      if (minValue > maxValue - 5) {
        this.maxSlider.value = minValue + 5;
        if (maxValue === parseInt(this.maxSlider.max)) {
          this.minSlider.value = parseInt(this.maxSlider.max) - 5;
        }
      }
      updatePrice();
    });
  }
  render() {
    const filteredProducts = [];
    this.products.forEach((item) => {
      if (
        item.dataset.collection == this.collection ||
        this.collection == null
      ) {
        if (item.dataset.state == this.state || this.state == null) {
          if (item.dataset.type == this.type || this.type == null) {
            if (
              parseInt(item.dataset.price) >= this.price_from &&
              parseInt(item.dataset.price) <= this.price_to
            ) {
              filteredProducts.push(item);
            }
          }
        }
      }
    });

    this.productsEl.innerHTML = filteredProducts
      .map((item) => item.outerHTML)
      .join("");
  }
  save(href) {
    let url = new URL(href || window.location);
    url.searchParams.set("collection", this.collection);
    url.searchParams.set("state", this.state);
    url.searchParams.set("type", this.type);
    url.searchParams.set("from", this.price_from);
    url.searchParams.set("to", this.price_to);
    history.pushState({}, "", url);
    href ? window.location.reload() : this.render();
  }
}

let catalog = document.querySelector(".catalog");
catalog && new Filter().init();

// ** swiper **//
var reviewsSwiperThumbs = new Swiper(".reviews__swiper .swiper-thumbs", {
  slidesPerView: "auto",
  spaceBetween: 10,
  breakpoints: {
    769: {
      slidesPerView: 3,
      spaceBetween: 15,
    },
    1280: {
      slidesPerView: 6,
      spaceBetween: 20,
    },
  },
});
var reviewsSwiper = new Swiper(".reviews__swiper .swiper", {
  slidesPerView: 1,
  spaceBetween: 10,
  navigation: {
    nextEl: ".reviews .btn-next",
    prevEl: ".reviews .btn-prev",
  },
  thumbs: {
    swiper: reviewsSwiperThumbs,
  },
});
var productSwiperThumbs = new Swiper(".product__swiper  .swiper-thumbs", {
  slidesPerView: 4,
  spaceBetween: 10,
  direction: "vertical",
  navigation: {
    nextEl: ".product .btn-next",
    prevEl: ".product .btn-prev",
  },
  breakpoints: {
    640: {
      slidesPerView: 4,
      spaceBetween: 15,
    },
  },
});
var productSwiper = new Swiper(".product__swiper .swiper", {
  slidesPerView: 1,
  spaceBetween: 10,
  thumbs: {
    swiper: productSwiperThumbs,
  },
});

//** fancybox **//
let dataFancybox = ["reviews", "product"];
dataFancybox.forEach((name) => {
  Fancybox.bind(`[data-fancybox="${name}"]`, {
    Images: { Panzoom: { maxScale: 3 } },
  });
});

//** yandex map *//
ymaps.ready(function () {
  const data = {
    center: [59.915126, 30.336131],
    marker: [59.915126, 30.336131],
    icon: "/assets/img/icons/marker.svg",
    city: "г. Санкт-Петербург",
    street: "ул. Заозерная д 3/11",
  };

  var myMap = new ymaps.Map(
      "yamap",
      {
        center: data.center,
        zoom: 14,
        controls: [],
        behaviors: [
          "drag",
          "dblClickZoom",
          "rightMouseButtonMagnifier",
          "multiTouch",
        ],
      },
      {
        suppressMapOpenBlock: true,
      }
    ),
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div style="color: #000; font-weight: bold;">$[properties.iconContent]</div>'
    ),
    myPlacemark0 = new ymaps.Placemark(
      data.marker,
      {
        balloonContentHeader: `<b style='color:#000;'>${data.city}</b>`,
        balloonContentFooter: data.street,
      },
      {
        iconLayout: "default#image",
        iconImageHref: data.icon,
        iconImageSize: [40, 50],
        iconImageOffset: [-20 / 2, -20],
      }
    );
  myMap.geoObjects.add(myPlacemark0);
  var zoomControl = new ymaps.control.ZoomControl({
    options: {
      size: "small",
      position: {
        top: 15,
        left: "auto",
        right: 15,
      },
    },
  });
  myMap.controls.add(zoomControl);
});

//** form **//
[].forEach.call(document.querySelectorAll(".v-mask"), function (input) {
  let keyCode;
  function mask(event) {
    event.keyCode && (keyCode = event.keyCode);
    let pos = this.selectionStart;
    if (pos < 3) event.preventDefault();
    let matrix = "+7 (___) ___-__-__",
      i = 0,
      def = matrix.replace(/\D/g, ""),
      val = this.value.replace(/\D/g, ""),
      newValue = matrix.replace(/[_\d]/g, function (a) {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      });
    i = newValue.indexOf("_");
    if (i != -1) {
      i < 5 && (i = 3);
      newValue = newValue.slice(0, i);
    }
    let reg = matrix
      .substr(0, this.value.length)
      .replace(/_+/g, function (a) {
        return "\\d{1," + a.length + "}";
      })
      .replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (
      !reg.test(this.value) ||
      this.value.length < 5 ||
      (keyCode > 47 && keyCode < 58)
    )
      this.value = newValue;
    if (event.type == "blur" && this.value.length < 5) this.value = "";

    if (this.value.length == 18 || this.value.length == 0) {
      input.dataset.numbervalid = "true";
    } else {
      input.dataset.numbervalid = "false";
    }
  }

  input.addEventListener("input", mask, false);
  input.addEventListener("focus", mask, false);
  input.addEventListener("blur", mask, false);
  input.addEventListener("keydown", mask, false);
});

const fileLabels = document.querySelectorAll("#file-upload");
fileLabels.forEach((label) => {
  const inp = label.querySelector("input");
  const span = label.querySelector("span");

  inp.addEventListener("change", function (e) {
    span.innerHTML = e.target.files[0].name.slice(0, 30) + "...";
  });
});

const form = document.querySelector("#form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = form.querySelector("#name");
  let phone = form.querySelector("#phone");

  if (phone.dataset.numbervalid === "true") {
    successSend("form");
  }
});

const popupForm = document.querySelector(".popup--form form");
popupForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = popupForm.querySelector("#name");
  let phone = popupForm.querySelector("#phone");

  if (phone.dataset.numbervalid === "true") {
    successSend();
  }
});

function successSend(parent) {
  let content = document.querySelector(".popup--form #form-content");
  let success = document.querySelector(".popup--form #form-success");

  content.style.display = "none";
  success.style.display = "flex";

  if (parent == "form") {
    openPopup("form");
  }

  setTimeout(() => {
    closePopup("form");
    setTimeout(() => {
      content.style.display = "flex";
      success.style.display = "none";
    }, 500);
  }, 3000);
}
