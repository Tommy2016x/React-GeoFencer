import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';

let geoFence = []; //json object
let vertices = [];
let fence = [];
let isDrawing = false;
let isComplete = false;
let deleted = [];

  let newoverlay = {
   type: null,
   info: null
   }

   const styles = theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    rightIcon: {
      marginLeft: theme.spacing.unit,
    },
    button: {
      margin: theme.spacing.unit,
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 260,
    },
     root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
      margin: theme.spacing.unit,
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing.unit * 2,
     },
      menu: {
      width: 200,
    },
  });

function clearOverlays() {
  console.log("clearing")
  for (var i = 0; i < fence.length; i++ ) {
    fence[i].setMap(null);
  }
  fence.length = 0;
}

class ExampleMap extends Component {
  constructor(props){
    super(props);

    this.state = {
      map: null,
      maps: null,
      drawingManager: null,
      name: null,
      view : "map",
      overlay: {
       type: null,
       info: null,
       },
       drawing: true,
       savemap: [],
       savefence: [],
       currentfence: null
   }  
  }
  static defaultProps = {
    center: {
      lat: 25.76,
      lng: -80.19
    },
    zoom: 10,
    geoFence: null,
    vertices: null,
    fence: null,
  }
 
  saveGeoFence = (callback,callback2) =>{
    if(this.state.name == null || this.state.name == ""){
      alert("please enter name for fence")
      return;
    }

    if(this.state.overlay.type == null){
      alert("please draw a fence")
      return;
    }
    let overlaycopy = this.state.overlay;
    let temp = this.state.savemap;

    let tempfence = this.state.currentfence;
    let fencearr = this.state.savefence;
    console.log(tempfence)
    console.log(overlaycopy)
    if(this.state.currentfence){
    fencearr.push(tempfence);
    this.setState({savefence: fencearr})
    }    
    let template = { name: this.state.name,
      overlay:overlaycopy,
      }
    if(this.state.overlay.info != null){
    temp.push(template)
    this.setState({savemap: temp});
    }
    callback();
  }

  newGeoFence = () => {
    console.log(fence)
    let map = this.state.map
    this.setState({map});
    let drawingManager1 = this.state.drawingManager;   

    if(this.state.overlay.info != null){
      let newoverlay = {
        type: null,
        info: null
        }
      drawingManager1.setMap(map);
      clearOverlays()
      this.setState({ drawingManager:drawingManager1 ,overlay:newoverlay});
      
    }
  }
  
  buttons = (callback) =>{
    let buttons = []
    let fences = this.state.savefence
    let maps = this.state.savemap
    let currentmap;
    let { classes } = this.props;
    
    if(maps){
    for(let i = 0; i< maps.length; i++){
      if(!deleted.includes(i)){
      currentmap = maps[i]
      buttons.push(<div> <Button onClick = {() => this.viewMap(i)} size = "small" variant = "contained" className={classes.button} > Name: {maps[i].name} </Button>
      <Button onClick = {() => this.deletemap(i,this.update2)} size = "small" variant = "contained" className={classes.button} color = "secondary" > Delete </Button> < br /> </div>) 
    }
  }
      return buttons;
  }
}
viewMap = (index) => {
  if(fence){
    clearOverlays()
  }
   
  console.log(this.state.savefence)
  let map = this.state.map
  console.log(this.state.savemap)
  fence = this.state.savefence[index].slice()
  fence[0].setMap(map);

  console.log(index)
}

increase = () => {
  console.log("increased")
  let value = this.state.overlay ;
  value.info.radius += 500
  this.setState({overlay: value})
}

deletemap = (index,callback) => {
  deleted.push(index);
  this.setState({view: "main"})
  clearOverlays()
  callback()
}

update2 = () =>{
  this.setState({view: "list"})
}
changeView = () => {

  if(this.state.view == 'map'){
    if(this.state.overlay.type != null){
      alert('Cannot view list while drawing map, please clear or save first')
      return
    }
    let manager = this.state.drawingManager;
    manager.drawingControl = false;
    this.setState({drawingManager: manager});
  this.setState({view: "list"})
  }
  else
  {
  this.setState({view: "map"})
    this.setState({name: null})
  clearOverlays()
  }
}  

drawing = () =>{
  if(this.state.view == "list")
  this.setState({drawing: false})

  else this.setState({drawing: true})
}

handleGoogleMapApi = (map, maps) => {
    let that = this;
    that.setState({map,maps});
    let drawingManager = new maps.drawing.DrawingManager({
      drawingMode: maps.drawing.OverlayType.CIRCLE,
      drawingControl: this.state.drawing,
      drawingControlOptions: {
        position: maps.ControlPosition.TOP_CENTER,
        drawingModes: ['circle', 'polygon']
      },
      circleOptions: {
        fillColor: '#FF0000',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        zIndex: 1,
        draggable: false,
        geodesic: true
      },
      polygonOptions: {
        fillColor: '#FF0000',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        zIndex: 1,
        draggable: false,
        geodesic: true
      },
    });
    drawingManager.setMap(map);
    that.setState({ drawingManager })
    
    maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        
      let overlay = that.state.overlay;
      
      that.setState({overlay})
      console.log("saved")

      drawingManager.setOptions({drawingMode: null});
      drawingManager.setOptions({map: null});
      
      fence.push(event.overlay);
      let savefence = fence.slice()

      that.setState({currentfence: savefence})
      
      console.log(fence) 
      if (event.type === 'circle') {
        overlay.type = event.type;
        var radius = event.overlay.getRadius();
        var center = event.overlay.getCenter().toString();

        overlay.info = {
          radius: radius,
          coord: {center}
        }
      }
      else{
        overlay.type = event.type;
        var poly = event.overlay.getPath()

        for (var i =0; i < poly.getLength(); i++) {
          var xy = poly.getAt(i);

          var vertex = {lat:xy.lat(),lng:xy.lng()}
          vertices.push(vertex)
        }
        overlay.info = {
            Info: {vertices}
        }
      }
    console.log(this.state)
    });

  }

  handleChange = (event) => {
    console.log(event.target.name,':',event.target.value);
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {

    const { classes } = this.props;

    const bootstrapURLKeys={
      key: 'AIzaSyBtdO5k6CRntAMJCF-H5uZjTCoSGX95cdk',
      libraries: ['drawing','places'].join(','),
    }
    if(this.state.view == "list")
    return(
      <div style={{ height: '100vh', width: '100%' }} >
         <GoogleMapReact
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}       
          bootstrapURLKeys={ bootstrapURLKeys }
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({map,maps})=>this.handleGoogleMapApiList(map,maps) }
        >
        <h1 className={classes.formControl} > Saved Fences </h1> 
        {this.buttons()}
        < br />
        <Button color = "primary" size = "small" variant = "contained" className={classes.button} onClick = {this.changeView}>
         Back to Map Editor
        </Button>
        </GoogleMapReact>
        </div>
    )
    else
    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}       
          bootstrapURLKeys={ bootstrapURLKeys }
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({map,maps})=>this.handleGoogleMapApi(map,maps) }
        >
        <FormControl className={classes.formControl}>
        <h1> Use the Tools to Draw a GeoFence </h1>
                <TextField
				          id="name"
				          label= 'Enter name for Geofence'
				          name='name'
				          className={classes.textField}
				          defaultvalue={this.state.name}
				          margin="normal"
				          onChange = {this.handleChange}
				        />  
                </FormControl>
                < br />    
        <Button color = "primary" size = "small" variant = "contained" className={classes.button} onClick={() => this.saveGeoFence(this.newGeoFence)}>
         Save Current
         <SaveIcon className={classes.rightIcon} />
        </Button>
        <Button size = "small" color = "secondary" variant = "contained" className={classes.button} onClick={this.newGeoFence}
        > Clear
        <DeleteIcon className={classes.rightIcon} /> 
        </Button>
        <Button  size = "small" variant = "contained" className={classes.button} onClick = {this.changeView}>
         View List
        </Button>
        <Button  size = "small" variant = "contained" className={classes.button} onClick = {this.increase}>
         test
        </Button>
        </GoogleMapReact>
      </div>
    );
  }
}

export default withStyles(styles)(ExampleMap);