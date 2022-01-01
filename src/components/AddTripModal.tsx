import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';


type AddTripModalProps = {
  closeAction: Function;
}

class AddTripModal extends React.Component<AddTripModalProps> {

  render() {
    return <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Add Trip</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="fixed">Name:</IonLabel>
            <IonInput></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Description:</IonLabel>
            <IonInput></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Kilometers:</IonLabel>
            <IonInput type="number"></IonInput>
          </IonItem>
          <IonItem>
          <IonButton color="secondary" onClick={() => this.props.closeAction()}>
                Cancel
            </IonButton>
            <IonButton color="success" onClick={() => this.props.closeAction()}>
                Add
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

