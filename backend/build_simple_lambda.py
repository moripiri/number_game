#!/usr/bin/env python3
"""
간단한 Lambda 배포 패키지 빌드 스크립트
"""
import os
import shutil
import zipfile

def build_simple_lambda_package():
    """간단한 Lambda 배포 패키지를 빌드합니다."""
    
    # 배포 디렉토리 생성
    deploy_dir = "lambda_simple_deploy"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    print("📦 간단한 Lambda 배포 패키지 빌드 중...")
    
    # Lambda 함수 코드 복사
    print("📁 Lambda 함수 코드 복사 중...")
    shutil.copy("lambda_function_simple.py", os.path.join(deploy_dir, "lambda_function.py"))
    
    # ZIP 파일 생성
    print("🗜️ ZIP 파일 생성 중...")
    zip_path = "lambda_simple_deploy.zip"
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, deploy_dir)
                zipf.write(file_path, arcname)
    
    # 정리
    shutil.rmtree(deploy_dir)
    
    print("✅ 간단한 Lambda 배포 패키지가 생성되었습니다: lambda_simple_deploy.zip")
    print("📊 파일 크기:", os.path.getsize(zip_path), "bytes")

if __name__ == "__main__":
    build_simple_lambda_package() 