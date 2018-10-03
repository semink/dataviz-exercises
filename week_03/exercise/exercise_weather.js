
/*
	Run the action when we are sure the DOM has been loaded
	https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
	Example:
	whenDocumentLoaded(() => {
		console.log('loaded!');
		document.getElementById('some-element');
	});
*/
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

const TEST_TEMPERATURES = [13, 18, 21, 19, 26, 25,16];


// Part 1 - DOM

function warmcold(temperature, warm = 23, cold = 17){
	return temperature >= warm ? 'warm' : temperature <= cold ? 'cold' : 'mid';
}
function showTemperatures(container_element, temperature_array) {
	container_element.innerHTML = "";
	temperature_array.map( (temperature) => {
		let p = document.createElement("p");
		p.appendChild(document.createTextNode(temperature));
		p.className = warmcold(temperature);
		container_element.appendChild(p);
	});
}


whenDocumentLoaded(() => {
	// Part 1.1: Find the button + on click event
	document.getElementById("btn-part1").onclick = () => (console.log("The button was clicked"));

	// Part 1.2: Write temperatures
	showTemperatures(document.getElementById("weather-part1"), TEST_TEMPERATURES);
	let forecast = new Forecast(document.getElementById("weather-part2"));
	let forecast_online = new ForecastOnline(document.getElementById("weather-part3"));
	let forecast_online_city = new ForecastOnlineCity(document.getElementById("weather-city"));
	forecast.reload();
	forecast_online.reload();

	// Optional
    document.getElementById("btn-city").onclick = () => {
        let city = document.getElementById("query-city").value;
        forecast_online_city.setCity(city);
        forecast_online_city.reload();
    };

});

// Part 2 - class

class Forecast {
	constructor(container) {
		this.container = container;
		this.temperatures = [1,2,3,4,5,6,7];
	}
	toString() {

	}
	print() {
		console.log(this.toString());
	}
	show() {
		this.container.innerHTML = "";
		this.temperatures.map( (temperature) => {
			let p = document.createElement("p");
			p.appendChild(document.createTextNode(temperature));
			p.className = warmcold(temperature);
			this.container.appendChild(p);
		});
	}
	reload() {
		this.temperatures = TEST_TEMPERATURES;
		this.show();
	}
}


// Part 3 - fetch

const QUERY_LAUSANNE = 'http://query.yahooapis.com/v1/public/yql?format=json&q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="Lausanne") and u="c"';

class ForecastOnline extends Forecast {
	reload() {
		fetch(QUERY_LAUSANNE)
			.then( response =>  response.json() )
			.then( myJson => {
			    this.temperatures = yahooToTemperatures(myJson);
			    this.show();
            });
	}
}

function yahooToTemperatures(data) {
	return data.query.results.channel.item.forecast.map( obj => (Number(obj.high) + Number(obj.low)) / 2);
}


// Part 4 - interactive
class ForecastOnlineCity extends Forecast {

    setCity(city) {
        this.city = city;
        this.query_city = 'http://query.yahooapis.com/v1/public/yql?format=json&q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+city+'") and u="c"';
    }
    reload() {
        fetch(this.query_city)
            .then( response =>  response.json() )
            .then( myJson => {
                this.temperatures = yahooToTemperatures(myJson);
                this.city = myJson.query.results.channel.location.city;
                this.show();
            });
    }
    show() {
        // display the name of the city
        super.show();
        let h4 = document.createElement("h4");
        h4.textContent = this.city;
        this.container.insertBefore(h4, this.container.childNodes[0]);
    }
}
