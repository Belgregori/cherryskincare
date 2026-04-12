import api from '../services/api';

/**
 * Script para asignar la imagen por defecto a todas las categorías que no tienen imagen
 */
export async function assignDefaultImageToCategories() {
  try {
    console.log('🔍 Obteniendo categorías...');
    
    // Obtener todas las categorías
    const categoriesResponse = await api.get('/admin/categories');
    const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
    
    console.log(`📋 Encontradas ${categories.length} categorías`);
    
    if (categories.length === 0) {
      console.log('⚠️ No hay categorías para actualizar');
      return;
    }

    // Leer la imagen desde el proyecto
    // Nota: En producción, la imagen debería estar en el servidor o subirse primero
    const imagePath = '/images/category-default.png';
    
    // Para cada categoría sin imagen, asignar la imagen por defecto
    for (const category of categories) {
      if (!category.imageUrl && category.id) {
        try {
          console.log(`📤 Subiendo imagen para categoría: ${category.name} (ID: ${category.id})`);
          
          // Crear un FormData con la imagen
          // Nota: Esto requiere que la imagen esté accesible desde el navegador
          // En su lugar, vamos a usar fetch para cargar la imagen y luego subirla
          
          const response = await fetch(`http://localhost:8080${imagePath}`);
          if (!response.ok) {
            console.error(`❌ No se pudo cargar la imagen desde ${imagePath}`);
            continue;
          }
          
          const blob = await response.blob();
          const formData = new FormData();
          formData.append('file', blob, 'category-default.png');
          
          // Subir la imagen a la categoría
          const uploadResponse = await api.post(
            `/admin/categories/${category.id}/image`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          console.log(`✅ Imagen asignada a "${category.name}":`, uploadResponse.data);
        } catch (error) {
          console.error(`❌ Error al asignar imagen a "${category.name}":`, error);
        }
      } else {
        console.log(`⏭️ Categoría "${category.name}" ya tiene imagen: ${category.imageUrl}`);
      }
    }
    
    console.log('✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}
