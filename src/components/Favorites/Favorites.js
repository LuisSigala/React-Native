import React from 'react'
import { 
    View, 
    Text,
    FlatList, 
    StyleSheet, 
    ActivityIndicator, 
    StatusBar,
 } from 'react-native'
import Storage from '../../libs/storage';
import Loader from '../../Generics/Loader';
import exampleStyles from '../../styles/example'
import BadgesItem from '../BadgesScreen/BadgesItem';

class Favorites extends React.Component{
    state = {
        loading: false,
        badges: undefined,
    }

    //It make a component with the things that it has inside
    componentDidMount = () => {
        this.getFavorites();
        this.focusEvent();
    }

    //This takes all the favorites badges and show us them,
    //Also they are stored locally in the storage file
    getFavorites = async () => {
        this.setState({loading: true, badges: undefined});
        try {
            const allKeys = await Storage.instance.getAllKeys();
            const keys = allKeys.filter(key => key.includes('favorite-'));
            const favs = await Storage.instance.multiGet(keys);
            const favorites = favs.map( fav => JSON.parse(fav[1]));
            this.setState({loading: false, badges: favorites});
        } catch (err) {
            console.log('get favorites err', err);
        }
    }

    //It send the user to the FavoritesDetails page at the 
    //moment he/she press the favorite badge
    handlePress = item => {
        this.props.navigation.navigate('FavoritesDetails', {item});
    };

    //It do the screen comes into focus when the favorites
    //badges are been obtained
    focusEvent = () => {
        this.focusEvent = this.props.navigation.addListener('focus', () => {
            this.getFavorites();
        });
    };

    //It will destroy the component when the focusListener process end
    componentWillUnmount = () => {
        this.focusListener();
    };

    render(){
        const {badges, loading} = this.state;

        if(loading == true && !badges){
            <Loader />;
        }

        return(
            <View style={[styles.favoritesContainer, exampleStyles.container, exampleStyles.horizontal]}>
                <StatusBar backgroundColor="transparent" translucent={true} />
                <FlatList 
                    style={styles.list}
                    data={badges}
                    renderItem={({item}) => (
                        <BadgesItem item={item} onPress={() => this.handlePress(item)} />
                    )} 
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    favoritesContainer:{
        paddingTop: 45,
    },
    list:{
        width: '100%',
        paddingHorizontal: 10,
    },
});

export default Favorites;