import React, { useRef, useState, useEffect } from 'react';
import { Autocomplete, DrawingManager, GoogleMap, Polygon, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MdDelete, MdSearch, MdHistory, MdMyLocation, MdClear, MdEdit, MdSave, MdLocationOn } from 'react-icons/md';
import { Button, Card, Typography } from '@material-tailwind/react';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useBranches from '../../ViewModel/BranchesViewModel/BranchesServices';
import branchesApi from '../../Model/Data/Branches/Branches';
import { showToast } from '../../Components/Toaster/Toaster';

const libraries = ['places', 'drawing'];

const Premisis = (props) => {
    const { data } = props;
    const { handleSelectChange, premisisValue, deleteSinglePremisis, addPremsis, resetPremisis, closeDrawer } = useBranches();
    ////console.log("type", typeof premisisValue)
    const mapRef = useRef();
    const polygonRefs = useRef([]);
    const activePolygonIndex = useRef();
    const autocompleteRef = useRef();
    const drawingManagerRef = useRef();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyDQ5csDpZbI4g7G5YX07OtXzX5gQ_R6vj0',
        libraries
    });

    const [polygons, setPolygons] = useState([]);
    const [premisesRecords, setPremisesRecords] = useState([]); // Track actual premises records
    const [newPolygons, setNewPolygons] = useState([]); // Track only newly created polygons
    const [userLocation, setUserLocation] = useState(null);
    const [searchedLocation, setSearchedLocation] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [hideSuggestions, setHideSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [showNearbyPlaces, setShowNearbyPlaces] = useState(true);
    // New state for autocomplete suggestions
    const [autocompletePredictions, setAutocompletePredictions] = useState([]);
    const [showAutocompleteSuggestions, setShowAutocompleteSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const autocompleteServiceRef = useRef(null);
    const autocompleteDebounceRef = useRef(null);
    
    // New state for drawing functionality
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [currentDrawingPolygon, setCurrentDrawingPolygon] = useState(null);
    const [drawingPoints, setDrawingPoints] = useState([]);
    const [isDrawingComplete, setIsDrawingComplete] = useState(false);
    const [isLoadingPremises, setIsLoadingPremises] = useState(false);

    // Load search history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('mapSearchHistory');
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        }
    }, []);

    // Load existing premises data when component mounts
    useEffect(() => {
        if (data && data.branch_id) {
            loadExistingPremises();
        }
    }, [data]);

    // Function to load existing premises from API
    const loadExistingPremises = async () => {
        if (!data || !data.branch_id) return;
        setIsLoadingPremises(true);
        try {
            const branchData = { branch_id: data.branch_id };
            const response = await branchesApi.getPremisis(branchData);
            const result = response.data;
            
            if (result.STATUS === 'SUCCESSFUL' && result.DB_DATA && Array.isArray(result.DB_DATA)) {
                // Parse all polygons from all premises records
                const allPolygons = [];
                
                // Store premises records for counting
                setPremisesRecords(result.DB_DATA);
                
                // Loop through each premises record
                result.DB_DATA.forEach(premisesRecord => {
                    const premisesId = premisesRecord._id;
                    const existingPremises = premisesRecord.json_data || [];
                    
                    // Loop through each polygon in the json_data array
                    existingPremises.forEach(feature => {
                        if (feature.geometry && feature.geometry.coordinates) {
                            const coords = feature.geometry.coordinates.map(coord => {
                                if (coord.lat && coord.lng) {
                                    return { lat: coord.lat, lng: coord.lng };
                                }
                                return null;
                            }).filter(coord => coord !== null);
                            
                            // Only add if polygon has valid coordinates
                            if (coords.length > 0) {
                                coords.id = premisesId;
                                allPolygons.push(coords);
                            }
                        }
                    });
                });
                
                // Set all polygons on the map
                setPolygons(allPolygons);

                // --- Fit map to polygon bounds ---
                if (allPolygons.length > 0 && mapRef.current && window.google) {
                    const bounds = new window.google.maps.LatLngBounds();
                    allPolygons.forEach(polygon => {
                        polygon.forEach(coord => {
                            bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
                        });
                    });
                    mapRef.current.fitBounds(bounds);
                }
            } else if (result.STATUS === 'ERROR' && result.ERROR_DESCRIPTION === 'Branch Geo Premises is not yet defined.') {
                // No premises defined, show user location if available
                setPolygons([]);
                if (userLocation && mapRef.current && window.google) {
                    mapRef.current.setCenter(userLocation);
                    mapRef.current.setZoom(16);
                }
            } else {
                // If no premises found, clear the polygons
                setPolygons([]);
            }
        } catch (error) {
            console.error('Error loading existing premises:', error);
            // If there's an error, we'll just show an empty map (user can draw new premises)
            setPolygons([]);
        } finally {
            setIsLoadingPremises(false);
        }
    };


    // console.log("setPolygons setPolygons",polygons)

    // Save search history to localStorage
    const saveSearchHistory = (place) => {
        const newHistory = [
            { 
                name: place.formatted_address || place.name, 
                location: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                },
                timestamp: Date.now(),
                placeId: place.place_id
            },
            ...searchHistory.filter(item => item.placeId !== place.place_id).slice(0, 9) // Keep only 10 items
        ];
        setSearchHistory(newHistory);
        localStorage.setItem('mapSearchHistory', JSON.stringify(newHistory));
    };

    // Clear search history
    const clearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('mapSearchHistory');
        setShowSearchHistory(false);
    };

    // Simplified search - no filter options needed

    // Get nearby places
    const getNearbyPlaces = (location, type = 'point_of_interest') => {
        if (!window.google || !mapRef.current) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const request = {
            location: location,
            radius: 2000, // 2km radius
            type: type
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setNearbyPlaces(results.slice(0, 5)); // Show top 5 nearby places
            }
        });
    };


    useEffect(() => {
        if (data && data.json_data) {
            try {
                // Parse the JSON string if it's a string
                const jsonData = typeof data.json_data === 'string' ? JSON.parse(data.json_data) : data.json_data;
                
                // Ensure jsonData is an array
                const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
                
                const parsedPolygons = dataArray.map(feature => {
                    // Check if coordinates exist and are in the expected format
                    if (feature.geometry && feature.geometry.coordinates) {
                        // Handle both array of [lng, lat] and array of {lat, lng} formats
                        return feature.geometry.coordinates.map(coord => {
                            if (Array.isArray(coord)) {
                                return { lat: coord[1], lng: coord[0] };
                            } else if (coord.lat && coord.lng) {
                                return { lat: coord.lat, lng: coord.lng };
                            }
                            return null;
                        }).filter(coord => coord !== null); // Remove any invalid coordinates
                    }
                    return [];
                }).filter(polygon => polygon.length > 0); // Remove empty polygons
                
                setPolygons(parsedPolygons);
            } catch (error) {
                console.error('Error parsing premises data:', error);
                setPolygons([]);
            }
        } else {
            setPolygons([]);
        }
    }, [data]);

    const defaultCenter = {
        lat: 34.0028888889,
        lng: 71.4998333333
    };
    const [center, setCenter] = useState(defaultCenter);

    // Add geolocation functionality
    useEffect(() => {
        if (isLoaded && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentUserLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(currentUserLocation);
                    setUserLocation(currentUserLocation);
                    getNearbyPlaces(currentUserLocation);
                    // console.log('User location:', currentUserLocation);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    // Keep default center if geolocation fails
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }, [isLoaded]);
    // Update map center when center state changes
    useEffect(() => {
        if (mapRef.current && center) {
            // console.log('Center state changed, updating map to:', center);
            mapRef.current.setCenter(center);
        }
    }, [center]);

    const containerStyle = {
        width: '100%',
        height: 'calc(100vh - 150px)',
        borderRadius: '10px',
        position: 'relative',
        zIndex: 1,
        cursor: 'pointer'
    };

    const autocompleteStyle = {
        boxSizing: 'border-box',
        border: '1px solid #ddd',
        width: '100%',
        height: '45px',
        padding: '0 45px 0 15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '16px',
        outline: 'none',
        backgroundColor: 'white',
    };

    // Initialize AutocompleteService when map is loaded
    useEffect(() => {
        if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
        
        // Cleanup debounce timer on unmount
        return () => {
            if (autocompleteDebounceRef.current) {
                clearTimeout(autocompleteDebounceRef.current);
            }
        };
    }, [isLoaded]);

    // Add CSS to hide Google Places default autocomplete dropdown (we're using custom dropdown)
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'hide-google-autocomplete';
        style.textContent = `
            .pac-container {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            const existingStyle = document.getElementById('hide-google-autocomplete');
            if (existingStyle) {
                document.head.removeChild(existingStyle);
            }
        };
    }, []);

    const polygonOptions = {
        fillOpacity: 0.3,
        fillColor: '#ff0000',
        strokeColor: '#ff0000',
        strokeWeight: 2,
        draggable: true,
        editable: true
    };

    const drawingManagerOptions = {
        polygonOptions: polygonOptions,
        drawingControl: false, // Hide default drawing controls
        drawingControlOptions: {
            position: window.google?.maps?.ControlPosition?.TOP_CENTER,
            drawingModes: [
                window.google?.maps?.drawing?.OverlayType?.POLYGON
            ]
        }
    };

    // Drawing mode functions
    const toggleDrawingMode = () => {
        if (isDrawingMode) {
            // Exit drawing mode
            setIsDrawingMode(false);
            setDrawingPoints([]);
            setIsDrawingComplete(false);
            if (currentDrawingPolygon) {
                currentDrawingPolygon.setMap(null);
                setCurrentDrawingPolygon(null);
            }
            if (drawingManagerRef.current) {
                drawingManagerRef.current.setDrawingMode(null);
            }
        } else {
            // Enter drawing mode
            setIsDrawingMode(true);
            setDrawingPoints([]);
            setIsDrawingComplete(false);
            if (drawingManagerRef.current) {
                drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
            }
        }
    };

    const handleMapClick = (event) => {
        if (!isDrawingMode) return;

        const latLng = event.latLng;
        const newPoint = { lat: latLng.lat(), lng: latLng.lng() };
        
        // Check if user is clicking near the starting point to close the polygon
        if (drawingPoints.length >= 3) {
            const firstPoint = drawingPoints[0];
            const distance = Math.sqrt(
                Math.pow(newPoint.lat - firstPoint.lat, 2) + 
                Math.pow(newPoint.lng - firstPoint.lng, 2)
            );
            
            // If clicking near the starting point, close the polygon automatically
            if (distance <= 0.0001) {
                completeDrawing();
                return;
            }
        }
        
        setDrawingPoints(prev => [...prev, newPoint]);

        // Create or update the drawing polygon
        if (currentDrawingPolygon) {
            const path = currentDrawingPolygon.getPath();
            path.push(latLng);
        } else {
            const newPolygon = new window.google.maps.Polygon({
                paths: [newPoint],
                fillColor: '#ff0000',
                fillOpacity: 0.3,
                strokeColor: '#ff0000',
                strokeWeight: 2,
                map: mapRef.current
            });
            setCurrentDrawingPolygon(newPolygon);
        }
    };

    const completeDrawing = () => {
        if (drawingPoints.length < 3) {
            showToast('Please draw at least 3 points to create a polygon', 'error');
            return;
        }

        // Validate that the polygon is properly closed (last point should be close to first point)
        const firstPoint = drawingPoints[0];
        const lastPoint = drawingPoints[drawingPoints.length - 1];
        
        // Calculate distance between first and last points
        const distance = Math.sqrt(
            Math.pow(lastPoint.lat - firstPoint.lat, 2) + 
            Math.pow(lastPoint.lng - firstPoint.lng, 2)
        );
        
        // If distance is too large, it means the polygon is not closed
        if (distance > 0.0001) { // Threshold for considering points as "close enough"
            showToast('Please close the polygon by clicking near the starting point to complete the drawing', 'error');
            return;
        }

        // Validate that we have at least 3 unique points (not just 3 points where last = first)
        const uniquePoints = drawingPoints.filter((point, index, arr) => {
            return index === 0 || 
                   Math.sqrt(
                       Math.pow(point.lat - arr[index - 1].lat, 2) + 
                       Math.pow(point.lng - arr[index - 1].lng, 2)
                   ) > 0.0001; // Points must be at least this distance apart
        });

        if (uniquePoints.length < 3) {
            showToast('Please draw at least 3 distinct points to create a valid polygon', 'error');
            return;
        }

        // Close the polygon by adding the first point at the end
        const closedPolygon = [...drawingPoints, drawingPoints[0]];
        
        
        // Add to polygons array
        setPolygons(prev => [...prev, closedPolygon]);
        
        // Add to new polygons array (for API sending)
        setNewPolygons(prev => [...prev, closedPolygon]);
        
        // Clear drawing state
        setIsDrawingMode(false);
        setDrawingPoints([]);
        setIsDrawingComplete(false);
        if (currentDrawingPolygon) {
            currentDrawingPolygon.setMap(null);
            setCurrentDrawingPolygon(null);
        }
        if (drawingManagerRef.current) {
            drawingManagerRef.current.setDrawingMode(null);
        }
        
        showToast('Polygon completed successfully!', 'success');
    };

    const cancelDrawing = () => {
        setIsDrawingMode(false);
        setDrawingPoints([]);
        setIsDrawingComplete(false);
        if (currentDrawingPolygon) {
            currentDrawingPolygon.setMap(null);
            setCurrentDrawingPolygon(null);
        }
        if (drawingManagerRef.current) {
            drawingManagerRef.current.setDrawingMode(null);
        }
    };


    // Function to create GeoJSON format for API
    const createGeoJSONForAPI = (polygons) => {
        // Convert polygons to the format expected by the API
        const features = polygons.map(polygon => ({
            geometry: {
                type: "Polygon",
                coordinates: polygon.map(point => ({ lat: point.lat, lng: point.lng }))
            }
        }));
        
        return JSON.stringify(features);
    };

    // Function to calculate center of a polygon
    const calculatePolygonCenter = (polygon) => {
        if (!polygon || polygon.length === 0) return null;
        
        let totalLat = 0;
        let totalLng = 0;
        let pointCount = 0;
        
        polygon.forEach(point => {
            // Handle both data structures: {lat, lng} and {lat: number, lng: number}
            const lat = typeof point === 'object' && point.lat !== undefined ? point.lat : point[1];
            const lng = typeof point === 'object' && point.lng !== undefined ? point.lng : point[0];
            
            if (typeof lat === 'number' && typeof lng === 'number') {
                totalLat += lat;
                totalLng += lng;
                pointCount++;
            }
        });
        
        if (pointCount === 0) return null;
        
        return {
            lat: totalLat / pointCount,
            lng: totalLng / pointCount
        };
    };

    // Function to move map to selected premises
    const moveToPremises = (premisesIndex) => {
        if (premisesIndex >= 0 && premisesIndex < premisesRecords.length) {
            const selectedPremisesRecord = premisesRecords[premisesIndex];
            const premisesId = selectedPremisesRecord._id;
            
            // Find all polygons belonging to this premises record
            const premisesPolygons = polygons.filter(polygon => polygon.id === premisesId);
            
            if (premisesPolygons.length > 0 && mapRef.current && window.google) {
                // console.log('Moving to premises:', premisesIndex + 1, 'with', premisesPolygons.length, 'polygons');
                
                // Create bounds for all polygons in this premises
                const bounds = new window.google.maps.LatLngBounds();
                
                // Add all points from all polygons to bounds
                premisesPolygons.forEach(polygon => {
                    polygon.forEach(point => {
                        bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
                    });
                });
                
                // Calculate the center of the bounds
                const center = bounds.getCenter();
                
                // console.log('Premises bounds:', {
                //     center: { lat: center.lat(), lng: center.lng() },
                //     bounds: {
                //         north: bounds.getNorthEast().lat(),
                //         south: bounds.getSouthWest().lat(),
                //         east: bounds.getNorthEast().lng(),
                //         west: bounds.getSouthWest().lng()
                //     }
                // });
                
                // Update map center
                setCenter({ lat: center.lat(), lng: center.lng() });
                
                // Use fitBounds with padding to make premises take up about 30% of screen
                // The padding value controls how much space around the bounds is visible
                // Higher padding = more zoomed out (premises takes up less screen)
                // Lower padding = more zoomed in (premises takes up more screen)
                const padding = 100; // Reduced padding for better zoom to specific premises
                
                setTimeout(() => {
                    mapRef.current.fitBounds(bounds, padding);
                    // console.log('Map fitted to premises', premisesIndex + 1, 'with padding', padding);
                }, 100);
            }
        }
    };

    // Modified addPremsis function to use correct format
    const handleSetPremises = async () => {
        // Check if user is currently in drawing mode with incomplete polygon
        if (isDrawingMode && drawingPoints.length > 0) {
            if (drawingPoints.length < 3) {
                showToast('Please complete the current drawing with at least 3 points before saving premises', 'error');
                return;
            }
            
            // Check if current drawing is not closed
            const firstPoint = drawingPoints[0];
            const lastPoint = drawingPoints[drawingPoints.length - 1];
            const distance = Math.sqrt(
                Math.pow(lastPoint.lat - firstPoint.lat, 2) + 
                Math.pow(lastPoint.lng - firstPoint.lng, 2)
            );
            
            if (distance > 0.0001) {
                showToast('Please complete the current drawing by closing the polygon before saving premises', 'error');
                return;
            }
            
            // If current drawing is complete, add it to polygons first
            const closedPolygon = [...drawingPoints, drawingPoints[0]];
            setPolygons(prev => [...prev, closedPolygon]);
            
            // Add to new polygons array (for API sending)
            setNewPolygons(prev => [...prev, closedPolygon]);
            
            // Clear drawing state
            setIsDrawingMode(false);
            setDrawingPoints([]);
            setIsDrawingComplete(false);
            if (currentDrawingPolygon) {
                currentDrawingPolygon.setMap(null);
                setCurrentDrawingPolygon(null);
            }
            if (drawingManagerRef.current) {
                drawingManagerRef.current.setDrawingMode(null);
            }
        }

        // Check if there are any new polygons to save
        if (newPolygons.length === 0) {
            showToast('Please draw at least one area before setting premises', 'error');
            return;
        }

        // Validate only new polygons before saving
        for (let i = 0; i < newPolygons.length; i++) {
            const polygon = newPolygons[i];
            
            // Check if polygon has at least 4 points (3 + closing point)
            if (polygon.length < 4) {
                showToast(`New polygon ${i + 1} is incomplete. Please ensure all polygons are properly closed.`, 'error');
                return;
            }
            
            // Check if polygon is properly closed (first and last points should be the same)
            const firstPoint = polygon[0];
            const lastPoint = polygon[polygon.length - 1];
            
            if (Math.abs(firstPoint.lat - lastPoint.lat) > 0.0001 || 
                Math.abs(firstPoint.lng - lastPoint.lng) > 0.0001) {
                showToast(`New polygon ${i + 1} is not properly closed. Please complete the drawing.`, 'error');
                return;
            }
        }

        // Only send new polygons, not existing ones
        const geoJSONString = createGeoJSONForAPI(newPolygons);
        const geoJSONData = {
            branch_id: data.branch_id,
            geoGeson: geoJSONString
        };
        
        try {
            const response = await branchesApi.addPremisis(geoJSONData);
            const result = response.data;
            
            if (result.STATUS === 'SUCCESSFUL') {
                showToast('Premises added successfully!', 'success');
                // Clear new polygons after successful save
                setNewPolygons([]);
                // Reload existing premises to show the updated state
                await loadExistingPremises();
                // Reset drawing state
                setIsDrawingMode(false); // Exit drawing mode
                setDrawingPoints([]); // Clear drawing points
                setIsDrawingComplete(false); // Reset drawing completion state
                if (currentDrawingPolygon) {
                    currentDrawingPolygon.setMap(null); // Remove current drawing polygon
                    setCurrentDrawingPolygon(null);
                }
                if (drawingManagerRef.current) {
                    drawingManagerRef.current.setDrawingMode(null); // Reset drawing manager
                }
            } else {
                showToast(result.ERROR_DESCRIPTION || 'Failed to add premises', 'error');
            }
        } catch (error) {
            console.error('Error setting premises:', error);
            showToast('Error setting premises. Please try again.', 'error');
        }
    };

    const onLoadMap = (map) => {
        mapRef.current = map;
        
        // Add click listener for drawing mode
        map.addListener('click', handleMapClick);
        
        // Ensure map is fully interactive
        map.setOptions({
            clickableIcons: true,
            gestureHandling: 'greedy',
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: false
        });
    };

    const onLoadPolygon = (polygon, index) => {
        polygonRefs.current[index] = polygon;
    };

    const onClickPolygon = (index) => {
        activePolygonIndex.current = index;
    };

    const onLoadAutocomplete = (autocomplete) => {
        autocompleteRef.current = autocomplete;
        
        // Add event listener to hide suggestions when user clicks on any suggestion
        if (autocomplete && autocomplete.gm_bindings_) {
            const input = autocomplete.gm_bindings_.autocomplete;
            if (input) {
                // Listen for place_changed event to hide suggestions
                window.google.maps.event.addListener(input, 'place_changed', () => {
                    // Hide the autocomplete dropdown
                    if (input.getPlace()) {
                        // Clear the input to hide suggestions
                        setTimeout(() => {
                            setShowSearchHistory(false);
                        }, 100);
                    }
                });
            }
        }
    };

    // Enhanced autocomplete search function - shows suggestions as user types (with debouncing)
    const performAutocompleteSearch = (query) => {
        // Clear previous debounce timer
        if (autocompleteDebounceRef.current) {
            clearTimeout(autocompleteDebounceRef.current);
        }

        if (!autocompleteServiceRef.current || !query || query.trim().length === 0) {
            setAutocompletePredictions([]);
            setShowAutocompleteSuggestions(false);
            setIsLoadingSuggestions(false);
            return;
        }

        // Don't search for very short queries (less than 2 characters)
        if (query.trim().length < 2) {
            setAutocompletePredictions([]);
            setShowAutocompleteSuggestions(false);
            setIsLoadingSuggestions(false);
            return;
        }

        // Debounce the API call to avoid too many requests (300ms delay)
        autocompleteDebounceRef.current = setTimeout(() => {
            setIsLoadingSuggestions(true);
            setShowAutocompleteSuggestions(true);

            autocompleteServiceRef.current.getPlacePredictions({
                input: query,
                componentRestrictions: { country: 'pk' },
                types: ['geocode', 'establishment'], // Include both addresses and places
                fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components', 'types']
            }, (predictions, status) => {
                setIsLoadingSuggestions(false);
                
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                    // Limit to top 5 suggestions for better UX
                    setAutocompletePredictions(predictions.slice(0, 5));
                    setShowAutocompleteSuggestions(true);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setAutocompletePredictions([]);
                    setShowAutocompleteSuggestions(false);
                } else {
                    // Handle other statuses (ERROR, OVER_QUERY_LIMIT, etc.)
                    setAutocompletePredictions([]);
                    setShowAutocompleteSuggestions(false);
                }
            });
        }, 300); // 300ms debounce delay
    };

    // Function to handle selection from autocomplete suggestions
    const handleSuggestionSelect = (prediction) => {
        if (!mapRef.current || !window.google) return;

        setIsSearching(true);
        setShowAutocompleteSuggestions(false);
        setSearchValue(prediction.description);

        // Use PlacesService to get place details
        const placesService = new window.google.maps.places.PlacesService(mapRef.current);
        placesService.getDetails({
            placeId: prediction.place_id,
            fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components']
        }, (place, status) => {
            setIsSearching(false);
            
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                if (place.geometry && place.geometry.location) {
                    const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };

                    // Save to search history
                    saveSearchHistory(place);

                    // Set searched location marker
                    setSearchedLocation(location);

                    // Center map on searched location
                    setCenter(location);

                    // Update search input with formatted address
                    setSearchValue(place.formatted_address || place.name || prediction.description);

                    // Get nearby places for the searched location
                    getNearbyPlaces(location);

                    // Navigate map to the location
                    setTimeout(() => {
                        if (mapRef.current) {
                            if (place.geometry.viewport) {
                                const bounds = new window.google.maps.LatLngBounds();
                                bounds.union(place.geometry.viewport);
                                mapRef.current.fitBounds(bounds);
                            } else {
                                mapRef.current.setZoom(15);
                                mapRef.current.setCenter(location);
                            }
                        }
                    }, 200);
                }
            } else {
                showToast('Failed to load place details. Please try again.', 'error');
            }
        });
    };

    // Manual search function for when user presses Enter
    const performManualSearch = (query) => {
        if (!window.google || !window.google.maps || !mapRef.current) return;
        
        // console.log('Performing manual search for:', query);
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({
            address: query,
            componentRestrictions: { country: 'PK' }
        }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
                const result = results[0];
                const location = {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                };
                
                // console.log('Manual search found location:', location);
                
                // Update states
                setSearchedLocation(location);
                setCenter(location);
                setSearchValue(result.formatted_address);
                
                // Move map to location
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.setCenter(location);
                        mapRef.current.setZoom(15);
                        // console.log('Map moved to manual search location');
                    }
                }, 100);
                
                // Get nearby places
                getNearbyPlaces(location);
                
                // Hide all suggestions when location is selected
                setHideSuggestions(true);
                setShowSearchHistory(false);
                setShowAutocompleteSuggestions(false);
                setAutocompletePredictions([]);
                setShowNearbyPlaces(false); // Hide nearby places suggestions
            } else {
                // console.log('Manual search failed:', status);
                showToast('Location not found. Please try a different search term.', 'error');
            }
        });
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            // console.log('Place selected:', place);
            
            if (place.geometry && place.geometry.location) {
                setIsSearching(true);
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                
                // console.log('Location coordinates:', location);
                
                // Save to search history
                saveSearchHistory(place);
                
                // Set searched location marker
                setSearchedLocation(location);
                
                // Center map on searched location
                setCenter(location);
                
                // Update search input with formatted address
                setSearchValue(place.formatted_address || place.name || '');
                
                // Get nearby places for the searched location
                getNearbyPlaces(location);
                
                // Navigate map to the location with timeout for better reliability
                if (mapRef.current) {
                    // console.log('Moving map to location:', location);
                    
                    // Use setTimeout to ensure the map is ready
                    setTimeout(() => {
                        if (place.geometry.viewport) {
                            const bounds = new window.google.maps.LatLngBounds();
                            bounds.union(place.geometry.viewport);
                            mapRef.current.fitBounds(bounds);
                            // console.log('Map fitted to bounds');
                        } else {
                            mapRef.current.setZoom(15);
                            mapRef.current.setCenter(location);
                            // console.log('Map centered on location with zoom 15');
                        }
                    }, 200);
                } else {
                    // console.log('Map reference not available');
                }
                
                setShowSearchHistory(false);
                setIsSearching(false);
                
                // Hide all suggestions when location is selected
                setHideSuggestions(true);
                setShowSearchHistory(false);
                setShowAutocompleteSuggestions(false);
                setAutocompletePredictions([]);
                setShowNearbyPlaces(false); // Hide nearby places suggestions
                
                // console.log('Map should now be centered on:', location);
            } else {
                // console.log('No geometry found for place:', place);
                setIsSearching(false);
            }
        }
    };

    // Go to current location
    const goToCurrentLocation = () => {
        if (userLocation && mapRef.current) {
            setCenter(userLocation);
            mapRef.current.setCenter(userLocation);
            mapRef.current.setZoom(16);
            setSearchValue('');
            setSearchedLocation(null);
        } else {
            // Request location again
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentUserLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(currentUserLocation);
                    setUserLocation(currentUserLocation);
                    if (mapRef.current) {
                        mapRef.current.setCenter(currentUserLocation);
                        mapRef.current.setZoom(16);
                    }
                    setSearchValue('');
                    setSearchedLocation(null);
                },
                (error) => console.log('Geolocation error:', error)
            );
        }
    };

    // Select from search history
    const selectFromHistory = (historyItem) => {
        setSearchedLocation(historyItem.location);
        setCenter(historyItem.location);
        setSearchValue(historyItem.name);
        setShowSearchHistory(false);
        
        if (mapRef.current) {
            mapRef.current.setCenter(historyItem.location);
            mapRef.current.setZoom(15);
        }
        
        getNearbyPlaces(historyItem.location);
    };


    const onLoadDrawingManager = (drawingManager) => {
        drawingManagerRef.current = drawingManager;
    };

    const onOverlayComplete = ($overlayEvent) => {
        drawingManagerRef.current.setDrawingMode(null);
        if ($overlayEvent.type === window.google.maps.drawing.OverlayType.POLYGON) {
            const newPolygon = $overlayEvent.overlay.getPath()
                .getArray()
                .map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() }));

            const startPoint = newPolygon[0];
            newPolygon.push(startPoint);
            $overlayEvent.overlay.setMap(null);
            
            // Add to both polygons (for display) and newPolygons (for API)
            setPolygons([...polygons, newPolygon]);
            setNewPolygons([...newPolygons, newPolygon]);

            const bounds = new window.google.maps.LatLngBounds();
            newPolygon.forEach(coord => bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng)));
            mapRef.current.fitBounds(bounds);
        }
    };

    const onDeleteDrawing = () => {
        const filtered = polygons.filter((polygon, index) => index !== activePolygonIndex.current);
        setPolygons(filtered);
        
        // Also remove from newPolygons if it exists there
        const filteredNew = newPolygons.filter((polygon, index) => {
            // Find the corresponding polygon in the main polygons array
            const mainIndex = polygons.findIndex(p => p === polygon);
            return mainIndex !== activePolygonIndex.current;
        });
        setNewPolygons(filteredNew);
    };

    const onEditPolygon = (index) => {
        const polygonRef = polygonRefs.current[index];
        if (polygonRef) {
            const coordinates = polygonRef.getPath()
                .getArray()
                .map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() }));

            const allPolygons = [...polygons];
            allPolygons[index] = coordinates;
            setPolygons(allPolygons);
        }
    };

    const clearSearch = () => {
        setSearchedLocation(null);
        setSearchValue('');
        setShowSearchHistory(false);
        setHideSuggestions(false);
        setShowAutocompleteSuggestions(false);
        setAutocompletePredictions([]);
        setShowNearbyPlaces(true); // Show nearby places again when clearing search
        setNearbyPlaces([]);
    };


    // Function to hide suggestions when clicking outside
    const handleHideSuggestions = () => {
        setShowSearchHistory(false);
    };

    return (
        isLoaded ? (
            <div className='map-container' style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }} onClick={handleHideSuggestions}>
                {/* Loading overlay for premises */}
                {isLoadingPremises && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <Typography variant="small" className="text-gray-700">
                            Loading existing premises...
                        </Typography>
                    </div>
                )}
                {/* Custom Drawing Tool Panel - Left Side */}
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', 
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    pointerEvents: 'none'
                }}>
                    {/* Pen Tool Button - Moved down 50px total */}
                    <div style={{ marginTop: '100px', pointerEvents: 'auto' }}>
                        <Button
                            variant={isDrawingMode ? "filled" : "outlined"}
                            color={isDrawingMode ? "red" : "blue"}
                            className="flex items-center gap-2 px-3 py-2 shadow-lg"
                            onClick={toggleDrawingMode}
                            title={isDrawingMode ? "Exit drawing mode" : "Start drawing area"}
                        >
                            <MdEdit className="text-lg" />
                            {isDrawingMode ? "Exit Pen" : "Pen Tool"}
                        </Button>
                    </div>

                    {/* Drawing Controls */}
                    {isDrawingMode && (
                        <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
                            <Typography variant="small" className="font-semibold text-gray-700">
                                Drawing Mode Active
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Click on map to add points
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                Points: {drawingPoints.length}
                            </Typography>
                            
                            <div className="flex gap-2">
                                <Button
                                    variant="filled"
                                    color="red"
                                    size="sm"
                                    className="flex-1"
                                    onClick={cancelDrawing}
                                >
                                    <MdClear className="text-sm mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Enhanced Search Panel */}
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '450px', pointerEvents: 'none' }}>
                    {/* Main Search Box */}
                    <div className="relative bg-white rounded-lg shadow-lg" style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <Autocomplete
                            onLoad={onLoadAutocomplete}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                types: ['geocode'],
                                componentRestrictions: { country: 'pk' },
                                fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components']
                            }}
                        >
                            <div className="relative">
                                <input
                                    type='text'
                                    placeholder="Search places in Pakistan (e.g., Islamabad G13)..."
                                    style={autocompleteStyle}
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        
                                        // Show search history only when input is empty
                                        setShowSearchHistory(value === '');
                                        
                                        // Hide nearby places when user is typing
                                        if (value.length > 0) {
                                            setShowNearbyPlaces(false);
                                        } else {
                                            setShowNearbyPlaces(true);
                                        }
                                        
                                        // Trigger autocomplete search as user types
                                        performAutocompleteSearch(value);
                                    }}
                                    onFocus={() => {
                                        if (searchValue === '') {
                                            setShowSearchHistory(true);
                                        } else if (searchValue.length >= 2) {
                                            // Show autocomplete suggestions if there's text
                                            setShowAutocompleteSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Delay hiding to allow click on suggestions
                                        setTimeout(() => {
                                            setShowSearchHistory(false);
                                            setShowAutocompleteSuggestions(false);
                                        }, 300);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // If there are suggestions, select the first one
                                            if (autocompletePredictions.length > 0) {
                                                handleSuggestionSelect(autocompletePredictions[0]);
                                            } else if (searchValue.trim()) {
                                                // Otherwise, trigger manual search
                                                performManualSearch(searchValue.trim());
                                            }
                                        } else if (e.key === 'Escape') {
                                            // Close suggestions on Escape
                                            setShowAutocompleteSuggestions(false);
                                            setAutocompletePredictions([]);
                                        }
                                    }}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                    <Button
                                        variant="text"
                                        size="sm"
                                        className="p-1 min-w-0 text-blue-500"
                                        onClick={goToCurrentLocation}
                                        title="Go to my location"
                                    >
                                        <MdMyLocation className="text-lg" />
                                    </Button>
                                    {(searchedLocation || searchValue) && (
                                        <Button
                                            variant="text"
                                            size="sm"
                                            className="p-1 min-w-0 text-red-500"
                                            onClick={clearSearch}
                                            title="Clear search"
                                        >
                                            <MdClear className="text-lg" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Autocomplete>

                        {/* Autocomplete Suggestions Dropdown */}
                        {showAutocompleteSuggestions && (autocompletePredictions.length > 0 || isLoadingSuggestions) && (
                            <Card className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto shadow-lg z-50" style={{ pointerEvents: 'auto' }}>
                                <div className="p-2">
                                    {isLoadingSuggestions ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            <Typography variant="small" className="ml-2 text-gray-600">
                                                Searching...
                                            </Typography>
                                        </div>
                                    ) : (
                                        <>
                                            <Typography variant="small" color="gray" className="mb-2 font-semibold flex items-center gap-1">
                                                <MdSearch /> Suggestions
                                            </Typography>
                                            {autocompletePredictions.map((prediction, index) => (
                                                <div
                                                    key={prediction.place_id || index}
                                                    className="flex items-start gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded transition-colors"
                                                    onClick={() => handleSuggestionSelect(prediction)}
                                                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                                                >
                                                    <MdLocationOn className="text-blue-500 mt-1 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <Typography variant="small" className="font-medium text-gray-900 truncate">
                                                            {prediction.structured_formatting?.main_text || prediction.description}
                                                        </Typography>
                                                        <Typography variant="small" color="gray" className="text-xs truncate">
                                                            {prediction.structured_formatting?.secondary_text || ''}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Search History */}
                        {showSearchHistory && searchHistory.length > 0 && (
                            <Card className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto shadow-lg" style={{ pointerEvents: 'auto' }}>
                                <div className="p-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <Typography variant="small" color="gray" className="font-semibold flex items-center gap-1">
                                            <MdHistory /> Recent Searches
                                        </Typography>
                                        <Button
                                            variant="text"
                                            size="sm"
                                            color="red"
                                            onClick={clearSearchHistory}
                                            className="text-xs p-1"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                    {searchHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                                            onClick={() => selectFromHistory(item)}
                                        >
                                            <MdLocationOn className="text-gray-500" />
                                            <div className="flex-1">
                                                <Typography variant="small" className="truncate">
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="text-xs">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                            </Card>
                        )}

                        {/* Nearby Places */}
                        {nearbyPlaces.length > 0 && searchedLocation && showNearbyPlaces && (
                            <Card className="absolute top-full mt-1 w-full max-h-40 overflow-y-auto shadow-lg" style={{ pointerEvents: 'auto' }}>
                                <div className="p-2">
                                    <Typography variant="small" color="gray" className="mb-2 font-semibold">
                                        Nearby Places
                                    </Typography>
                                    {nearbyPlaces.map((place, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer rounded"
                                            onClick={() => {
                                                const location = {
                                                    lat: place.geometry.location.lat(),
                                                    lng: place.geometry.location.lng()
                                                };
                                                setSearchedLocation(location);
                                                setCenter(location);
                                                setSearchValue(place.name);
                                                setShowNearbyPlaces(false); // Hide nearby places after selection
                                                if (mapRef.current) {
                                                    mapRef.current.setCenter(location);
                                                    mapRef.current.setZoom(17);
                                                }
                                            }}
                                        >
                                            <MdLocationOn className="text-blue-500 text-sm" />
                                            <div className="flex-1">
                                                <Typography variant="small" className="truncate text-xs">
                                                    {place.name}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="text-xs">
                                                    {place.vicinity}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                    <GoogleMap
                        key={`${center.lat}-${center.lng}`}
                        zoom={15}
                        center={center}
                        onLoad={onLoadMap}
                        mapContainerStyle={containerStyle}
                        options={{
                            clickableIcons: true,
                            gestureHandling: 'greedy',
                            zoomControl: true,
                            mapTypeControl: true,
                            scaleControl: true,
                            streetViewControl: true,
                            rotateControl: true,
                            fullscreenControl: true,
                        mapTypeControlOptions: {
                            position: window.google?.maps?.ControlPosition?.TOP_LEFT,
                            mapTypeIds: [
                                window.google?.maps?.MapTypeId?.ROADMAP,
                                window.google?.maps?.MapTypeId?.SATELLITE,
                                window.google?.maps?.MapTypeId?.HYBRID,
                                window.google?.maps?.MapTypeId?.TERRAIN
                            ]
                        }
                        }}
                    >
                    <DrawingManager
                        onLoad={onLoadDrawingManager}
                        onOverlayComplete={onOverlayComplete}
                        options={drawingManagerOptions}
                    />
                    {
                        polygons.map((iterator, index) => {
                            // Find which premises this polygon belongs to
                            const polygonPremisesId = iterator.id;
                            const premisesIndex = premisesRecords.findIndex(record => record._id === polygonPremisesId);
                            
                            return (
                                <Polygon
                                    key={index}
                                    onLoad={(event) => onLoadPolygon(event, index)}
                                    onMouseDown={() => {
                                        onClickPolygon(index);
                                        // Move to the correct premises when clicking on polygon
                                        if (premisesIndex !== -1) {
                                            moveToPremises(premisesIndex);
                                        }
                                    }}
                                    onMouseUp={() => onEditPolygon(index)}
                                    onDragEnd={() => onEditPolygon(index)}
                                    options={polygonOptions}
                                    paths={iterator}
                                    draggable
                                    editable
                                />
                            );
                        })
                    }
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            icon={{
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                                        <circle cx="12" cy="12" r="3" fill="white"/>
                                    </svg>
                                `),
                                scaledSize: new window.google.maps.Size(24, 24),
                                anchor: new window.google.maps.Point(12, 12)
                            }}
                            title="Your current location"
                        />
                    )}
                    {searchedLocation && (
                        <Marker
                            position={searchedLocation}
                            icon={{
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 2C10.48 2 6 6.48 6 12c0 7 10 18 10 18s10-11 10-18c0-5.52-4.48-10-10-10zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#EA4335"/>
                                        <circle cx="16" cy="12" r="4" fill="white"/>
                                    </svg>
                                `),
                                scaledSize: new window.google.maps.Size(32, 32),
                                anchor: new window.google.maps.Point(16, 32)
                            }}
                            title={searchValue || "Searched location"}
                        />
                    )}
                    </GoogleMap>
                </div>

                <div className='py-4 flex items-center justify-between' style={{ position: 'relative', zIndex: 1000, pointerEvents: 'none' }}>
                    <div className='flex gap-3' style={{ pointerEvents: 'auto' }}>
                        <Button
                            className='capitalize px-4 py-2 text-xs font-medium bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 transition-all rounded-lg font-poppins'
                            onClick={handleSetPremises}
                        >Set Premises</Button>
                        <Button
                            className='capitalize px-4 py-2 text-xs font-medium bg-white text-red-500 border border-red-100 hover:bg-red-50 shadow-sm transition-all rounded-lg font-poppins'
                            disabled={polygons?.length === 0}
                            onClick={async () => {
                                try {
                                    // Delete all premises for this branch by sending branch_id
                                    await deleteSinglePremisis(data.branch_id);
                                    
                                    // Reload premises data from API to show updated state
                                    await loadExistingPremises();
                                    
                                } catch (error) {
                                    console.error('Error resetting premises:', error);
                                    showToast('Error resetting premises. Please try again.', 'error');
                                }
                            }}
                        >Reset Premises</Button>
                    </div>
                    <div className='flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm'>
                        <Typography variant="small" className="text-gray-600 font-poppins font-medium">
                            {premisesRecords.length > 0 ? `${premisesRecords.length} premise${premisesRecords.length > 1 ? 's' : ''} loaded` : 'No premises found'}
                            {newPolygons.length > 0 && ` | ${newPolygons.length} new polygon${newPolygons.length > 1 ? 's' : ''} ready to save`}
                        </Typography>
                    </div>
                    <div className='flex items-center gap-3' style={{ pointerEvents: 'auto' }}>
                        <div className="w-48">
                            <CustomSelect
                                placeHolderTitle='Select Premises'
                                value={premisisValue?.premisis}
                                options={premisesRecords?.map((record, i) => ({ value: i, label: `Premises ${i + 1}`, id: record._id }))}
                                onChangeHandler={(selectedOption) => {
                                    handleSelectChange(selectedOption, 'premisis', data);
                                    // Move map to selected premises
                                    if (selectedOption && selectedOption.value !== undefined) {
                                        moveToPremises(selectedOption.value);
                                    }
                                }}
                                customStyle={false}
                            />
                        </div>
                        <Button
                            className='capitalize px-4 py-2 text-xs font-medium bg-red-500 text-white shadow-red-500/20 hover:shadow-red-500/40 transition-all rounded-lg font-poppins'
                            onClick={async () => {
                                const selectedOption = premisisValue?.premisis;
                                const selectedPolygon = polygons[selectedOption?.value];
                                const premisesId = selectedOption?.id || selectedPolygon?.id;
                                if (premisesId) {
                                    try {
                                        await deleteSinglePremisis(premisesId);
                                        
                                        // Reload premises data from API to show updated state
                                        await loadExistingPremises();
                                        
                                        // Clear selection
                                        handleSelectChange(null, 'premisis', data);
                                        
                                    } catch (error) {
                                        console.error('Error deleting premises:', error);
                                        showToast('Error deleting premises. Please try again.', 'error');
                                    }
                                }
                            }}
                        >
                            Delete Premises
                        </Button>
                    </div>
                </div>
            </div>
        ) : null
    );
}

export default Premisis;
