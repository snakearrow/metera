import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, useIonAlert } from '@ionic/react';
import { add } from 'ionicons/icons';

type AddTemplateTripModalProps = {
  closeAction: Function;
}

type AddTemplateTripModalState = {
  name: string,
  description: any,
  kilometers: number,
  showWarning: boolean
}

class AddTripModal extends React.Component<AddTemplateTripModalProps, AddTemplateTripModalState> {

  constructor(props: any) {
    super(props)
    this.state = {
      name: "",
      description: undefined,
      kilometers: 0,
      showWarning: false
    }
  }
  
  handleInputNameChange(_name: any) {
    const name = _name.detail.value;
    this.setState({
      name: name
    });
  }
  
  handleInputDescChange(_desc: any) {
    const desc = _desc.detail.value;
    this.setState({
      description: desc
    });
  }
  
  handleInputKmChange(_km: any) {
    const km = parseFloat(_km.detail.value);
    this.setState({
      kilometers: km
    });
  }
  
  closeFunc() {
    const km = this.state.kilometers;
    if (this.state.name.length <= 0 || km <= 0) {
      this.setState({ showWarning: true});
      return;
    }
    this.props.closeAction([this.state.name, this.state.description, km]);
  }

  render() {
    return <>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem lines="none">
            <IonLabel position="fixed">Name:</IonLabel>
            <IonInput placeholder="e.g. Work, Groceries,..." value={this.state.name} onIonChange={(e) => this.handleInputNameChange(e)}></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="fixed">Description:</IonLabel>
            <IonInput placeholder="(optional)" value={this.state.description} onIonChange={(e) => this.handleInputDescChange(e)}></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="fixed">Kilometers:</IonLabel>
            <IonInput type="number" value={this.state.kilometers} onIonChange={(e) => this.handleInputKmChange(e)}></IonInput>
          </IonItem>
          {(this.state.showWarning) && (
            <IonItem lines="none">
              <IonLabel color="danger">Please fill in all necessary data.</IonLabel>
            </IonItem>
          )}
          <IonItem lines="none">
            <IonButton color="secondary" style={{width: 100, height: 30}} 
              onClick={() => this.props.closeAction()}>Cancel</IonButton>
            <IonButton color="success" style={{width: 100, height: 30}} onClick={() => this.closeFunc()}>Add&nbsp;
                <IonIcon icon={add} />
            </IonButton>
          </IonItem>
       </IonList>
      </IonContent>
    </>
  };

}

export default ({closeAction}: { closeAction: Function }) => (
  <AddTripModal closeAction={closeAction}>
  </AddTripModal>
)

