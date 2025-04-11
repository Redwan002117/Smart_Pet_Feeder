import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import { Pet } from '../types';
import '../styles/Pets.css';

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [petName, setPetName] = useState<string>('');
  const [petWeight, setPetWeight] = useState<number>(0);
  const [petAge, setPetAge] = useState<number>(0);
  const [petBreed, setPetBreed] = useState<string>('');
  const [petActivityLevel, setPetActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [petDietary, setPetDietary] = useState<string>('');

  useEffect(() => {
    fetchPets();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('pets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pets' },
        handlePetUpdate
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user's pets
  const fetchPets = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch pets
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      setPets(data || []);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  // Handle realtime pet updates
  const handlePetUpdate = (payload: any) => {
    const { eventType, new: newPet, old: oldPet } = payload;
    
    if (eventType === 'INSERT') {
      setPets(prev => [...prev, newPet].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (eventType === 'UPDATE') {
      setPets(prev => 
        prev.map(pet => 
          pet.pet_id === newPet.pet_id ? newPet : pet
        )
      );
    } else if (eventType === 'DELETE') {
      setPets(prev => 
        prev.filter(pet => pet.pet_id !== oldPet.pet_id)
      );
    }
  };

  // Reset form fields
  const resetForm = () => {
    setPetName('');
    setPetWeight(0);
    setPetAge(0);
    setPetBreed('');
    setPetActivityLevel('medium');
    setPetDietary('');
  };

  // Open edit modal with pet data
  const handleEditClick = (pet: Pet) => {
    setEditingPet(pet);
    setPetName(pet.name);
    setPetWeight(pet.health_data.weight);
    setPetAge(pet.health_data.age);
    setPetBreed(pet.health_data.breed || '');
    setPetActivityLevel(pet.health_data.activity_level || 'medium');
    setPetDietary((pet.health_data.dietary_restrictions || []).join(', '));
    setShowAddModal(true);
  };

  // Submit the form (create or update pet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Validate form
      if (!petName.trim()) {
        setError('Pet name is required');
        return;
      }
      
      // Parse dietary restrictions into array
      const dietaryRestrictions = petDietary
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      // Create health data object
      const healthData = {
        weight: petWeight,
        age: petAge,
        breed: petBreed.trim(),
        activity_level: petActivityLevel,
        dietary_restrictions: dietaryRestrictions
      };
      
      if (editingPet) {
        // Update existing pet
        const { error } = await supabase
          .from('pets')
          .update({
            name: petName.trim(),
            health_data: healthData
          })
          .eq('pet_id', editingPet.pet_id);
          
        if (error) throw error;
      } else {
        // Create new pet
        const { error } = await supabase
          .from('pets')
          .insert([{
            user_id: user.id,
            name: petName.trim(),
            health_data: healthData
          }]);
          
        if (error) throw error;
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      setEditingPet(null);
      
    } catch (err: any) {
      console.error('Error saving pet:', err);
      setError(err.message || 'Failed to save pet');
    }
  };

  // Delete a pet
  const handleDelete = async (petId: string) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('pet_id', petId);
        
      if (error) throw error;
      
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setError(`Failed to delete pet: ${err.message}`);
    }
  };

  // Calculate recommended food amount based on pet data
  const calculateFoodRecommendation = (pet: Pet): string => {
    // This is a simplified calculation - in a real app, this would be more sophisticated
    const { weight, age, activity_level } = pet.health_data;
    
    // Base amount in grams
    let baseAmount = weight * 20;
    
    // Adjust for age
    if (age < 1) {
      baseAmount *= 1.2; // Puppies/kittens need more food
    } else if (age > 7) {
      baseAmount *= 0.8; // Senior pets often need less food
    }
    
    // Adjust for activity level
    switch (activity_level) {
      case 'low':
        baseAmount *= 0.8;
        break;
      case 'high':
        baseAmount *= 1.2;
        break;
      default:
        // Medium is baseline
        break;
    }
    
    // Round to nearest 5g
    const roundedAmount = Math.round(baseAmount / 5) * 5;
    
    // Daily recommendation
    return `${roundedAmount}g per day`;
  };

  // Calculate how to divide food throughout the day
  const getFeedingSchedule = (pet: Pet): string => {
    const { age } = pet.health_data;
    
    if (age < 1) {
      return "3-4 times per day";
    } else if (age < 7) {
      return "2 times per day";
    } else {
      return "2-3 smaller meals per day";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pet profiles...</p>
      </div>
    );
  }

  return (
    <div className="pets-container">
      <div className="pets-header">
        <h1>My Pets</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            resetForm();
            setEditingPet(null);
            setShowAddModal(true);
          }}
        >
          <i className="icon-plus"></i> Add Pet
        </button>
      </div>
      
      {error && (
        <div className="error-alert">
          <i className="icon-warning"></i>
          <p>{error}</p>
          <button 
            className="error-close" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      {pets.length === 0 ? (
        <div className="no-pets">
          <div className="no-pets-icon">
            <i className="icon-paw"></i>
          </div>
          <h2>No pets added yet</h2>
          <p>Add your pets to track their feeding schedules and health data.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.pet_id} className="pet-card">
              <div className="pet-card-header">
                <h3>{pet.name}</h3>
                <div className="pet-actions">
                  <button 
                    className="btn btn-icon" 
                    onClick={() => handleEditClick(pet)}
                    title="Edit Pet"
                  >
                    <i className="icon-edit"></i>
                  </button>
                  <button 
                    className="btn btn-icon btn-danger" 
                    onClick={() => setDeleteConfirm(pet.pet_id)}
                    title="Delete Pet"
                  >
                    <i className="icon-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="pet-info">
                <div className="pet-detail">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{pet.health_data.weight} kg</span>
                </div>
                <div className="pet-detail">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{pet.health_data.age} {pet.health_data.age === 1 ? 'year' : 'years'}</span>
                </div>
                {pet.health_data.breed && (
                  <div className="pet-detail">
                    <span className="detail-label">Breed:</span>
                    <span className="detail-value">{pet.health_data.breed}</span>
                  </div>
                )}
                <div className="pet-detail">
                  <span className="detail-label">Activity Level:</span>
                  <span className="detail-value pet-activity">
                    {pet.health_data.activity_level || 'Medium'}
                  </span>
                </div>
                {pet.health_data.dietary_restrictions && pet.health_data.dietary_restrictions.length > 0 && (
                  <div className="pet-detail">
                    <span className="detail-label">Dietary Restrictions:</span>
                    <div className="dietary-tags">
                      {pet.health_data.dietary_restrictions.map((item, index) => (
                        <span key={index} className="dietary-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pet-recommendations">
                <h4>Feeding Recommendations</h4>
                <div className="recommendation-item">
                  <i className="icon-bowl"></i>
                  <div className="recommendation-content">
                    <span className="recommendation-label">Daily Amount</span>
                    <span className="recommendation-value">{calculateFoodRecommendation(pet)}</span>
                  </div>
                </div>
                <div className="recommendation-item">
                  <i className="icon-clock"></i>
                  <div className="recommendation-content">
                    <span className="recommendation-label">Schedule</span>
                    <span className="recommendation-value">{getFeedingSchedule(pet)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit Pet Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPet ? `Edit ${editingPet.name}` : 'Add New Pet'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="pet-name">Name</label>
                  <input
                    id="pet-name"
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Pet name"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pet-weight">Weight (kg)</label>
                    <input
                      id="pet-weight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={petWeight}
                      onChange={(e) => setPetWeight(parseFloat(e.target.value) || 0)}
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="pet-age">Age (years)</label>
                    <input
                      id="pet-age"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={petAge}
                      onChange={(e) => setPetAge(parseFloat(e.target.value) || 0)}
                      placeholder="Age"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pet-breed">Breed (optional)</label>
                  <input
                    id="pet-breed"
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="Breed"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="pet-activity">Activity Level</label>
                  <select
                    id="pet-activity"
                    value={petActivityLevel}
                    onChange={(e) => setPetActivityLevel(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pet-dietary">Dietary Restrictions (comma-separated, optional)</label>
                  <input
                    id="pet-dietary"
                    type="text"
                    value={petDietary}
                    onChange={(e) => setPetDietary(e.target.value)}
                    placeholder="e.g., grain-free, low-fat"
                  />
                  <small className="form-note">Separate multiple restrictions with commas</small>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingPet ? 'Save Changes' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Pet</h2>
              <button 
                className="modal-close" 
                onClick={() => setDeleteConfirm(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="confirm-message">
                Are you sure you want to delete this pet? This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;
