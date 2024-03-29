import React from 'react'
import { 
    View, 
    ActivityIndicator, 
    StyleSheet, 
    FlatList,
    StatusBar,
    Text,
    Alert,
    TouchableOpacityBase,
} from 'react-native'
import BadgesItem from './BadgesItem'
import Loader from '../../Generics/Loader'
import Storage from '../../libs/storage'
import Colors from '../../res/Colors'
import Http from '../../libs/http'
import BadgesSearch from './BadgesSearch'

class BadgesScreen extends React.Component{
    state = {
        loading: false,
        badges: undefined,
        badgesCopy: undefined,
    }

    //This make a component of the getBadge information
    componentDidMount(){
        this.fetchdata();
        this.focusEvent();
        this.blurEvent();
    }

    //It do the screen comes into focus
    focusEvent = () => {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.setFetchInterval();
        });
    };

    //It do the screen comes out focus
    blurEvent = () => {
        this.blurListener = this.props.navigation.addListener('blur', () => {
            clearInterval(this.interval);
        });
    };

    //This do an interval that reload the information each 3 seconds
    setFetchInterval = () => {
        this.interval = setInterval(this.fetchdata, 3000);
    };

    //This make a request to the database and obtain all the badges
    fetchdata = async() => {
        console.log('Fetching data');
        this.setState({loading: true});
        let response = await Http.instance.get_all();
        this.setState({loading: false, badges: response, badgesCopy: response});
    };

    //This make a request to the database and obtain all the badges
    handlePress = item => {
        this.props.navigation.navigate('BadgesDetail', {item});
    };

    //This allows the navegation to BadgesEdit
    handleEdit = item => {
        console.log(this.props.navigation);
        this.props.navigation.navigate('BadgesEdit', {item});
    };

    //All of this makes a query that filter information of 
    //the user that is in the badges
    handleChange = query => {
        const {badgesCopy} = this.state;
        
        const badgesFiltered = badgesCopy.filter( badge => {
            return badge.name.toLowerCase().includes(query.toLowerCase());
        });
        this.setState({badges: badgesFiltered});
    
        if(query){
            clearInterval(this.interval);
        } else {
            this.setFetchInterval();
        }
    };

    //With this the statement to delete with the id of user 
    //badges is addded to an icon in the BadgesScreen, also it include a text confirmation 
    handleDelete =  item => {
        Alert.alert(
            'Are you sure?',
            `Do you really want to delete ${item.name}'s badge?\n\nThis process cannot be undone`,
            [
                {
                    text: 'Cancel',
                    style:'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        this.setState({loading: true, badges: undefined});
                        await Http.instance.remove(item._id);
                        let key = `favorite-${item._id}`;
                        await Storage.instance.remove(key);
                        this.fetchdata();
                    },
                    style: 'destructive',
                },
            ],
            {
                cancelable: true,
            },
        );
    };

    //This will destroy the component created
    componentWillUnmount() {
        this.focusListener();
        this.blurListener();
    }

    render(){
        const {badges, loading} = this.state;
        if(loading == true && !badges){
            return <Loader />;
        }
        return(
            <View style={[styles.container, styles.horizontal]}>
                <StatusBar backgroundColor="transparent" translucent={true} />
                <BadgesSearch onChange={this.handleChange} />
                <FlatList 
                style={styles.list} 
                data={badges} 
                renderItem={({item}) => (
                    <BadgesItem 
                        item={item} 
                        onPress={() => this.handlePress(item)} 
                        onEdit={()=>this.handleEdit(item)}
                        onDelete={()=>this.handleDelete(item)}
                    />
                )}
                keyExtractor = {(item, index) => index.toString()}
                />  
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Colors.charade,
    },
    horizontal:{
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    loader:{
        height: '100%',
        paddingHorizontal: 10,
    },
    list:{
        width: '100%',
        paddingHorizontal: 10,
    },
});

export default BadgesScreen;