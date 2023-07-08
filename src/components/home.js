import { useEffect, useState } from "react";
import { getDistanceFromLatLonInKm } from "./utils";
import { Statistic, Typography, Space } from "antd";

var map;

function runPlot(from , data, type ){

    let slice = {"bubble": undefined, "line": 15, "polygon": 10};
    let divvisible = document.getElementById("map");
    if (map && "off" in map && divvisible !== undefined) { 
      map = map.off();
      map = map.remove(); } 
    
      map = L.map('map', {
        center: [from.lat, from.lon],
        zoom: 3
      });
      L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 12
      }).addTo(map);
  
      data.slice(0, slice[type]).map((b,i)=>{
        let line = [[from.lat, from.lon], [b.lat1, b.lon1]];
          if(["line"].includes(type))
          {
            L.polyline(line, {color: 'red'}).addTo(map).bindTooltip(
            `${b.city1}-${Number(b.distance).toFixed(0)} KM`, 
            {offset: [-100, i*10], sticky : false, permanent : true}).openTooltip();
          
            L.circle([b.lat1 , b.lon1]
              ,{
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 1/(b.pop1),
                radius: 0.0005*b.pop1
            }).addTo(map)
          }
  
          if(["bubble"].includes(type))
          {
          L.circle([b.lat1 , b.lon1]
            ,{
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 1/(b.pop1),
              radius: 0.0005*b.pop1
          }).addTo(map).bindPopup(
            `${b.city1}-${Number(b.pop1).toFixed(0)}`).openPopup();
          }
      });
  }

export const HomeComponent = (props) =>
{

    const [pop, setPop]  = useState(0);

    useEffect(()=>{
    
        let p = props.data.reduce((a, b) => +a + +b.population, 0);
        setPop(p);
    },[props.data])

    const filterPop = (v) => {
        let p =  props.data.filter(p => p.population > v);
        return p ? p.length : 0;
    }


  useEffect(() => {

    let cities = props.data;
    if (window && cities.length > 0 && pop > 0) {
      
      let contain = []
      let activeCity = cities[0];
      let tcoor = { lat: activeCity.lat, lon: activeCity.lon }; 
      let avg = pop/cities.length;
      cities.map((rec) => {
        let d = getDistanceFromLatLonInKm(tcoor.lat, tcoor.lon, rec.lat, rec.lon);        
        if (rec.population > avg)
          contain.push({
            'city1': rec.name, 'pop1': rec.population, 'pop2': activeCity.population,
            'distance': Number(d).toFixed(2), 'city2': activeCity.name,
            'lat1': rec.lat, 'lon1': rec.lon 
          })
      })
      contain.sort((a,b) => a.distance - b.distance)
      runPlot(cities[0], contain, 'bubble');
    }

  }, [ props.data, pop])

    return(
        <>
            <Space  direction="horizontal" >
            <Typography.Title role="contentinfo">{props.country}</Typography.Title>
            <Statistic value={pop} title="Population Included"></Statistic>
            <Statistic value={"length" in props.data ? props.data.length : 0} title="No of Areas included" ></Statistic>
            <Statistic value={ filterPop(1000000) }  title="Million+ Areas"></Statistic>
            <Statistic value={ filterPop(500000) }  title="Half Million+ Areas"></Statistic>
            <Statistic value={ filterPop(100000) }  title="100 thousand+ Areas"></Statistic>
            </Space>


            <div id="map" style={{ height: '60vh' , width : '100vw' }} ></div>
                
        </>
    )
}