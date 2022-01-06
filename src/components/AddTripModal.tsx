import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react';
import { add } from 'ionicons/icons';
import { Trip } from '../interfaces/trip';
import { Stats } from '../interfaces/stats';
import { loadTemplateTrips, getIconForKeyword, loadStatistics } from '../util';  


type AddTripModalProps = {
  closeAction: Function;
}

type AddTripModalState = {
  selectedSegment: string,
  showWarning: boolean,
  templateTrips: Trip[],
  stats: any,
  
  mileage: number,
  
  name: string,
  description: string,
  kilometers: number
}


class AddTripModal extends React.Component<AddTripModalProps, AddTripModalState> {

  constructor(props: any) {
    super(props);
    this.state = {
      selectedSegment: "custom",
      showWarning: false,
      templateTrips: [],
      stats: null,
      mileage: 0,
      name: "",
      description: "",
      kilometers: 0
    }
  }

  handleSegmentChange(event: any) {
    const selectedSegment = event.detail.value;
    
    if (selectedSegment === "template" && this.state.templateTrips.length <= 0) {
      loadTemplateTrips().then(result => {
        if (result) {
          console.log("loaded " + result.length + " template trips");
          this.setState({
            templateTrips: result
          });
        }
      });
    }
    
    else if (selectedSegment == "mileage" && this.state.stats === null) {
      loadStatistics().then(result => {
        if (result) {
          console.log(result);
          this.setState({
            stats: result
          });
        }
      });
    }
    
    this.setState({
      selectedSegment: selectedSegment
    });
  }
  
  addTemplateTrip(name: string) {
    this.props.closeAction(["template", name]);
  }
  
  addMileage() {
    this.props.closeAction(["mileage", this.state.mileage]);
  }
  
  addCustom() {
    this.props.closeAction(["custom", this.state.name, this.state.description, this.state.kilometers]);
  }
  
  handleMileageChange(event: any) {
    const mileage = +event.detail.value;
    this.setState({
      mileage: mileage
    });
  }
  
  handleNameChange(name: any) {
    this.setState({
      name: name
    });
  }
  
  handleDescChange(description: any) {
    this.setState({
      description: description
    });
  }
  
  handleKilometersChange(event: any) {
    let km = +event.detail.value;
    this.setState({
      kilometers: km
    });
  }
  
  buildBody() {
    const selectedSegment = this.state.selectedSegment;
    
    if (selectedSegment === "custom") {
      return (
        <IonList>
          <IonItem>
            <IonLabel position="fixed">Name:</IonLabel>
            <IonInput onIonChange={e => this.handleNameChange(e.detail.value)}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Description:</IonLabel>
            <IonInput onIonChange={e => this.handleDescChange(e.detail.value)}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Kilometers:</IonLabel>
            <IonInput type="number" onIonChange={e => this.handleKilometersChange(e)}></IonInput>
          </IonItem>
          <IonItem>
          <IonButton color="secondary" onClick={() => this.props.closeAction()}>
                Cancel
            </IonButton>
            <IonButton color="success" onClick={() => this.addCustom()}>
                Add
                <IonIcon icon={add} />
            </IonButton>
          </IonItem>
       </IonList>
      );
    }
    
    else if (selectedSegment === "template") {
      if (this.state.templateTrips === null) {
        return (<IonList></IonList>);
      } else if (this.state.templateTrips.length <= 0) {
        return (<IonLabel>No template trips found</IonLabel>);
      }
      
      let items = []
      for (let i = 0; i < this.state.templateTrips.length; i++) {
        const trip = this.state.templateTrips[i];
        const _icon = getIconForKeyword(trip.name);
        items.push(
          <IonItem>
            <IonIcon slot="start" icon={_icon}/>
            <IonLabel>
              <h2>{trip.name}</h2>
              <h3>{trip.description}</h3>
              <p>{trip.kilometers}km</p>
            </IonLabel>
            <IonButton slot="end" color="success" onClick={() => this.addTemplateTrip(trip.name)}>Add
              <IonIcon icon={add} />
            </IonButton>
          </IonItem>
        )
      }
      
      return (
         <IonList>
          {items}
       </IonList>
      );
    }
    
    let mileage = "";
    if (this.state.stats !== null) {
      mileage = this.state.stats.mileage;
    }
    return (
      <IonList>
        <IonItem lines="none">
          <IonInput type="number" placeholder={mileage} onIonChange={e => this.handleMileageChange(e)}>New Mileage:</IonInput>
          <IonLabel>km</IonLabel>
        </IonItem>
        <IonItem lines="none">
          <IonButton color="success" onClick={() => this.addMileage()}>Add
            <IonIcon slot="end" icon={add}></IonIcon>
          </IonButton>
        </IonItem>
      </IonList>
      
      );
  }

  render() {
    return <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Add Trip</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment value={this.state.selectedSegment} onIonChange={e => this.handleSegmentChange(e)}>
          <IonSegmentButton value="custom">
            <IonLabel>Custom</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="template">
            <IonLabel>Template</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="mileage">
            <IonLabel>Mileage</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <div style={{height:20}}></div>
        
        {this.buildBody()}
        
      </IonContent>
    </>
  };

}

export default ({closeAction}: { closeAction: Function }) => (
  <AddTripModal closeAction={closeAction}>
  </AddTripModal>
)

