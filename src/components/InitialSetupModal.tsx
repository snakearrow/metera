import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonGrid, IonCol, IonRow } from '@ionic/react';
import { happy } from 'ionicons/icons';
import './InitialSetupModal.css';

type InitialSetupModalProps = {
  closeAction: Function;
}

class InitialSetupModal extends React.Component<InitialSetupModalProps> {

  render() {
    return <>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel class="label-heading">Hi there!</IonLabel>
            </IonCol>
            <IonCol>
              <IonIcon icon={happy} style={{height:40, width:40}}></IonIcon>
            </IonCol>
          </IonRow>
        </IonGrid>

          <IonLabel>This seems to be the first time you open this App. You can either</IonLabel>
          <div style={{padding:10, textAlign:'center'}}>
            <IonButton color="secondary" style={{height:25}} onClick={() => this.props.closeAction()}>have a look</IonButton>
          </div>
          <IonLabel>or enter some initial data and start using the App:</IonLabel>
          <IonList>
            <IonItem lines="none">
              <IonLabel position="stacked">Total Kilometer Budget:</IonLabel>
              <IonInput placeholder="10000" type="number"></IonInput>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">Years:</IonLabel>
              <IonInput placeholder="4" type="number"></IonInput>
            </IonItem>
          </IonList>
          <div style={{padding:10, textAlign:'center'}}>
              <IonButton color="success" style={{height:40, width: 120}}>Start</IonButton>
          </div>
        </IonContent>
    </>
  };

}

export default ({closeAction}: { closeAction: Function }) => (
  <InitialSetupModal closeAction={closeAction}>
  </InitialSetupModal>
)
