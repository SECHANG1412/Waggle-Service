from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    db_user: str = Field(..., alias="DB_USER")
    db_password: str = Field(..., alias="DB_PASSWORD")
    db_host: str = Field("localhost", alias="DB_HOST")
    db_port: str = Field("3306", alias="DB_PORT")
    db_name: str = Field(..., alias="DB_NAME")

    class Config:
            env_file = ".env"
            case_sensitive = True
            extra = "allow"
            populate_by_name = True

    @property
    def tmp_db(self) -> str:
          return f"{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    @property
    def database_url(self) -> str:
        return f"mysql+asyncmy://{self.tmp_db}"
    
    @property
    def sync_database_url(self) -> str:
        return f"mysql+pymysql://{self.tmp_db}"
    

settings = Settings()