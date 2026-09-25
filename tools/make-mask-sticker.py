#!/usr/bin/env python3
"""Render the goaltender mask OBJ as poster stickers for v3: a posterized
grayscale render with a thin ink contour and a white sticker border.

    python3 tools/make-mask-sticker.py [out-dir]

Writes goalie-mask-{q34,q20,front}-640.{png,webp} (three-quarter, twenty
degrees and head-on). The model faces +X, so head-on is a quarter turn."""
import math, sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
SRC='assets/model/GMask.obj'; OUT=sys.argv[1] if len(sys.argv)>1 else 'v3/assets/img'
V=[]; F=[]
for line in open(SRC):
    if line.startswith('v '): V.append([float(x) for x in line.split()[1:4]])
    elif line.startswith('f '):
        vi=[int(p.split('/')[0])-1 for p in line.split()[1:]]
        for k in range(1,len(vi)-1): F.append([vi[0],vi[k],vi[k+1]])
V=np.asarray(V,float); F=np.asarray(F,np.int64); V-=V.mean(0)
def R_y(a):
    c,s=math.cos(a),math.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def R_x(a):
    c,s=math.cos(a),math.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def render(yaw,pitch,W=1200,H=1300):
    P=V@R_y(yaw).T@R_x(pitch).T
    A,B,C=P[F[:,0]],P[F[:,1]],P[F[:,2]]
    n=np.cross(B-A,C-A); ln=np.linalg.norm(n,axis=1,keepdims=True); ln[ln<1e-12]=1; n/=ln
    # smoothed normals: average face normals onto vertices, then back to faces
    VN=np.zeros_like(P); np.add.at(VN,F.ravel(),np.repeat(n,3,axis=0)); l=np.linalg.norm(VN,axis=1,keepdims=True); l[l<1e-12]=1; VN/=l
    fn=(VN[F[:,0]]+VN[F[:,1]]+VN[F[:,2]])/3; l=np.linalg.norm(fn,axis=1,keepdims=True); l[l<1e-12]=1; fn/=l
    front=n[:,2]>0
    depth=(A[:,2]+B[:,2]+C[:,2])/3; order=np.argsort(depth); order=order[front[order]]
    ext=P[:,:2]; mn=ext.min(0); mx=ext.max(0); size=(mx-mn).max(); scale=(min(W,H)*0.84)/size
    cx=(mn[0]+mx[0])/2; cy=(mn[1]+mx[1])/2
    L=np.array([-0.4,0.55,0.73]); L/=np.linalg.norm(L)
    shade=np.clip(fn@L,0,1)
    img=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    for i in order:
        s=shade[i]; g=int(70+175*(s**0.8))
        pts=[((P[j,0]-cx)*scale+W/2, H/2-(P[j,1]-cy)*scale) for j in F[i]]
        d.polygon(pts, fill=(g,g,g,255))
    return img
def sticker(img, name):
    a=img.split()[3]
    # smooth the shading, then posterize into 4 print-like tones
    rgb=img.convert('RGB').filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(1.2))
    g=np.asarray(rgb.convert('L')).astype(float)
    tones=np.array([64,140,200,240])
    q=np.digitize(g,[100,165,215]); g2=tones[q].astype(np.uint8)
    body=Image.fromarray(g2).convert('RGBA'); body.putalpha(a)
    # thin dark contour: alpha edge
    inner=a.filter(ImageFilter.MinFilter(9))
    edge=ImageChops.subtract(a,inner)
    ink=Image.new('RGBA',img.size,(21,21,21,255)); ink.putalpha(edge)
    body=Image.alpha_composite(body, ink)
    # white sticker border
    halo=a.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(1))
    halo=halo.point(lambda v:255 if v>80 else 0)
    out=Image.new('RGBA',img.size,(0,0,0,0))
    white=Image.new('RGBA',img.size,(255,255,255,255)); white.putalpha(halo)
    out=Image.alpha_composite(out,white); out=Image.alpha_composite(out,body)
    bbox=out.getbbox(); out=out.crop((bbox[0]-8,bbox[1]-8,bbox[2]+8,bbox[3]+8))
    for w in (640,):
        r=out.resize((w,int(out.height*w/out.width)),Image.LANCZOS)
        r.save(f'{OUT}/goalie-{name}-{w}.png',optimize=True); r.save(f'{OUT}/goalie-{name}-{w}.webp',quality=88,method=6)
    print(name, out.size)
sticker(render(math.pi/2-0.5,0.12),'mask-q34')
sticker(render(math.pi/2-0.3,0.08),'mask-q20')
sticker(render(math.pi/2,0.0),'mask-front')
