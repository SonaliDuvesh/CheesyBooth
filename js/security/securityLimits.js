
export const SECURITY_LIMITS = {

  MAX_IMAGE_FILE_SIZE: 15 * 1024 * 1024,      
  MAX_GIF_FILE_SIZE: 25 * 1024 * 1024,        
  MAX_IMPORT_FILE_SIZE: 10 * 1024 * 1024,     

  MAX_IMAGE_DIMENSION: 8192,                   
  MAX_IMAGE_PIXELS: 36_000_000,               
  MAX_CANVAS_RENDER_PIXELS: 25_000_000,       

  MAX_GIF_FRAMES: 120,                        
  MAX_GIF_DURATION_MS: 30_000,                

  MAX_ACTIVE_STICKERS: 60,                    
  MAX_ACTIVE_TEXT_STICKERS: 20,               
  MAX_STICKER_DIMENSION: 2048,                

  MAX_TEXT_LENGTH: 120,                       
  MAX_STAMP_TEXT_LENGTH: 50,                  
  MAX_URL_LENGTH: 2048,                       
  MAX_AI_RESPONSE_LENGTH: 10_000,             

  MAX_HISTORY_STACK_DEPTH: 40,               
  MAX_SESSION_HISTORY_COUNT: 50,              
  MAX_SAVED_PROJECTS: 30,                     

  OPERATION_TIMEOUT_MS: 45_000,               
  REMOTE_FETCH_TIMEOUT_MS: 15_000,            
  AI_REQUEST_TIMEOUT_MS: 20_000,              

  ALLOWED_IMAGE_PROTOCOLS: ['https:', 'http:', 'blob:', 'data:'],
  ALLOWED_IMAGE_MIMES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ],
};
