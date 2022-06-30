//create map and initialize location with marker
let map;
let infowindow;
const newJersey = { lat: 39.833851, lng: -74.871826 };
const losAngeles = {lat: 34.063380, lng: -118.358080};
const googleMapId = "696e7ffea63e1448";
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: newJersey,
        zoom: 10,
        mapId: googleMapId
    });
     infowindow = new google.maps.InfoWindow();
    
}

const getStores = () => {
    const zipCode= document.getElementById('zip-code').value;
    if(!zipCode ){
        clearLocations();
        noEmptyField(); 
        return;
    }
    const API_URL = 'http://localhost:3000/api/stores';
    const fullURL = `${API_URL}?zip_code=${zipCode}`;
    fetch(fullURL)
    .then((res) => {
        if(res.status === 200){
            return res.json();
        }else {
            throw new Error(res.status)
        }
    }).then((data) => {
        if(data.length > 0){
            checkIfPhoneNumberEmpty(data)
            clearLocations();
            searchLocationsNear(data);
            displayStoreList(data);
            setOnClickListener();
        }else {
            clearLocations();
            noStoresFound();
        }
        
    })
}

const searchLocationsNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();
    stores.forEach((store, index) => {
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]);
        let name = store.storeName;
        let address = store.addressLines[0];
        let storeNum = index + 1;
        let openStatusText = store.openStatusText;
        let phoneNumber = store.phoneNumber;
        bounds.extend(latlng)
        
        createMarker(latlng, name, address, storeNum, openStatusText, phoneNumber);
    });
    map.fitBounds(bounds)
}

const createMarker = (latlng, name, address, storeNum, openStatusText, phoneNumber) => {
    
    let contentString = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-open-status">
                ${openStatusText}
            </div>
            <div class="store-info-address">
            <div class="icon">
                <i class="fas fa-location-arrow"></i>
            </div>
                <span>
                    ${address}
                </span>          
            </div>
            <div class="store-info-phone">
            <div class="icon">
                <i class="fas fa-phone-alt"></i>
            </div>
                <span>
                    <a href="tel:${phoneNumber}"> ${phoneNumber} </a>
                </span>     
            </div>
        </div>
    `;
    let marker = new google.maps.Marker({
        position: latlng,
        map: map,
        label: `${storeNum}`
    });
    google.maps.event.addListener(marker, 'click', ()=>{
        infowindow.setContent(contentString);
        infowindow.open(map, marker)
    });
    markers.push(marker)
}

let displayStoreList = (stores) => {
   
    let innerCardContent = '';

    stores.forEach((store, index) => {
        innerCardContent += `
        <div class="store-container">
            <div class="store-container-background">
                <div class="store-info-container">
                    <div class="store-address">
                        <span>${store.addressLines[0]}</span>
                        <span>${store.addressLines[1]}</span>
                    </div>
                    <div class="store-phone-number">
                        ${store.phoneNumber}
                    </div>
                </div>
                <div class="store-number-container">
                    <div class="store-number">
                        ${index+1}
                    </div>
                </div>
            </div>
        </div>
        `
    });

    document.querySelector(".stores-list").innerHTML = innerCardContent
    
}


const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach((el, index)=>{
        el.addEventListener('click', ()=>{
            google.maps.event.trigger(markers[index], 'click')
        })
        
    })
}

const onEnter = (e) => {
    if(e.key === 'Enter'){
        getStores();
    }
}

const clearLocations = () => {
    infowindow.close();
    for (let i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers.length = 0;
}

const noStoresFound = () => {
    const html = `
        <div class="no-stores-found">
            Sorry, No Stores Found...
        </div>
    `
    document.querySelector('.stores-list').innerHTML = html;
}

const noEmptyField = () => {
    const html = `
        <div class="no-stores-found">
            Sorry, Input Field Cant be Empty...
        </div>
    `
    document.querySelector('.stores-list').innerHTML = html;
}

const checkIfPhoneNumberEmpty = (stores) => {
  stores.forEach((store) =>{
      if(store.phoneNumber === null){
          store.phoneNumber = "Not Available"
      }else{
          store.phoneNumber = formatPhoneNumber(store.phoneNumber);
          
      }
  })  
} 

const formatPhoneNumber = (phoneNumber) => {
    //Filter only numbers from the input
    let cleaned = ('' + phoneNumber).replace(/\D/g, '');
    
    //Check if the input is of correct length
    let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    };
  
    return null
  };